// Code execution backend — Node-only locally, browser-aware for Vercel.
// Local dev: runs node/python3/g++ via spawn.
// Browser/Vercel: returns a clear "use local dev to run code" message.
// Piston API: whitelist-only since 2026-02-15, kept as future fallback hook.

export const LANG_MAP = {
  javascript: { language: 'javascript', version: '18.15.0', filename: 'main.js', label: 'JavaScript', localRunner: 'node' },
  python:     { language: 'python',     version: '3.10.0', filename: 'main.py', label: 'Python',     localRunner: 'python3' },
  java:       { language: 'java',       version: '15.0.2', filename: 'Main.java', label: 'Java',    localRunner: null },
  cpp:        { language: 'c++',        version: '10.2.0', filename: 'main.cpp', label: 'C++',       localRunner: 'g++' },
  go:         { language: 'go',         version: '1.16.2', filename: 'main.go', label: 'Go',         localRunner: null },
}

export const LANG_KEYS = Object.keys(LANG_MAP)

function isNodeRuntime() {
  return typeof process !== 'undefined' && !!process.versions?.node && typeof window === 'undefined'
}

/**
 * Execute source code. Local-first (Node), browser-aware.
 * @returns {Promise<{stdout, stderr, runtime, exitCode, error?, backend}>}
 */
export async function executeCode(langKey, source, stdin = '', problem = null) {
  const cfg = LANG_MAP[langKey]
  if (!cfg) throw new Error(`Unknown language: ${langKey}`)

  // Browser / Vercel: try in-browser execution via Pyodide / sandboxed JS Worker.
  // No backend, no rate limits, works on Vercel for free. See browser-exec.js.
  if (!isNodeRuntime()) {
    const { runJsInBrowser, runPythonInBrowser, buildBrowserDriver, isBrowserExecAvailable } = await import('./browser-exec.js')
    if (isBrowserExecAvailable(langKey) && problem) {
      // Status callback is wired in by the caller via window.__algodeckExecStatus
      const onStatus = typeof window !== 'undefined' ? window.__algodeckExecStatus : null
      // Parse the JSON-encoded test args (same format as Node stdin path)
      let testArgs = []
      try { testArgs = JSON.parse(stdin || '[]') } catch { testArgs = [] }
      const driver = buildBrowserDriver(langKey, problem, source, testArgs)
      // Debug: expose last driver for inspection via window.__algodeckLastDriver
      if (typeof window !== 'undefined') {
        window.__algodeckLastDriver = driver
        window.__algodeckLastTestArgs = testArgs
      }
      const t0 = performance.now()
      const res = langKey === 'python'
        ? await runPythonInBrowser(driver, onStatus)
        : await runJsInBrowser(driver)
      const runtime = Math.round(performance.now() - t0)
      return {
        stdout: res.stdout,
        stderr: res.stderr || '',
        runtime,
        exitCode: res.exitCode,
        backend: `browser-${langKey}`,
      }
    }
    if (isBrowserExecAvailable(langKey) && !problem) {
      // No problem context — fall back to raw execution (user supplied full driver)
      const onStatus = typeof window !== 'undefined' ? window.__algodeckExecStatus : null
      const t0 = performance.now()
      const res = langKey === 'python'
        ? await runPythonInBrowser(source, onStatus)
        : await runJsInBrowser(source)
      return {
        stdout: res.stdout,
        stderr: res.stderr || '',
        runtime: Math.round(performance.now() - t0),
        exitCode: res.exitCode,
        backend: `browser-${langKey}`,
      }
    }
    // C++ / Java / Go not available in-browser. Local dev handles them.
    return {
      stdout: '',
      stderr: `⚠️ ${cfg.label} execution is not available in the web build.\n\n` +
              `Supported in browser: JavaScript, Python (runs locally in your browser via WebAssembly).\n` +
              `For ${cfg.label}, clone the repo and run 'npm run dev' locally.`,
      runtime: null,
      exitCode: -1,
      backend: 'web-unsupported',
    }
  }

  // Node runtime — dynamic-import Node-only modules.
  const [
    { execFile, spawn },
    { promisify },
    { writeFile, unlink, mkdir },
    path,
    os,
  ] = await Promise.all([
    import('child_process'),
    import('util'),
    import('fs/promises'),
    import('path'),
    import('os'),
  ])
  const execFileAsync = promisify(execFile)

  // Local-first execution for JS / Python / C++
  const localRunners = {
    javascript: async (src, sin) => runLocalJs(src, sin, { spawn, writeFile, unlink, path, os }),
    python:     async (src, sin) => runLocalPy(src, sin, { spawn, writeFile, unlink, path, os }),
    cpp:        async (src, sin) => runLocalCpp(src, sin, { spawn, execFileAsync, writeFile, unlink, mkdir, path, os }),
  }
  const local = localRunners[langKey]
  if (local) {
    try {
      return await local(source, stdin)
    } catch (e) {
      return { stdout: '', stderr: e.message || String(e), runtime: null, exitCode: -1, backend: `local-${langKey}` }
    }
  }

  // No local runner (Java/Go) and Piston is whitelist-only — return clear error.
  return {
    stdout: '',
    stderr: `${cfg.label} execution is not available — no local interpreter installed and Piston API is whitelist-only as of 2026-02-15. Install ${cfg.label} locally to enable.`,
    runtime: null,
    exitCode: -1,
    backend: 'none',
  }
}

// ──────── Local runners (Node-only) ────────

function runWithStdin(spawn, cmd, args, stdin, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = '', resolved = false
    const finish = (code) => { if (resolved) return; resolved = true; resolve({ stdout, stderr, code }) }
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      stderr += (stderr ? '\n' : '') + 'timeout after ' + timeoutMs + 'ms'
      finish(124)
    }, timeoutMs)
    child.stdout.on('data', d => { stdout += d.toString() })
    child.stderr.on('data', d => { stderr += d.toString() })
    child.on('error', e => { clearTimeout(timer); stderr += (stderr ? '\n' : '') + e.message; finish(-1) })
    child.on('close', code => { clearTimeout(timer); finish(code ?? 0) })
    if (stdin) child.stdin.write(stdin)
    child.stdin.end()
  })
}

async function runLocalJs(source, stdin, { spawn, writeFile, unlink, path, os }) {
  const tmp = path.join(os.tmpdir(), `algodeck-${Date.now()}-${Math.random().toString(36).slice(2)}.js`)
  await writeFile(tmp, source)
  try {
    const { stdout, stderr, code } = await runWithStdin(spawn, 'node', [tmp], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-node' }
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

async function runLocalPy(source, stdin, { spawn, writeFile, unlink, path, os }) {
  const tmp = path.join(os.tmpdir(), `algodeck-${Date.now()}-${Math.random().toString(36).slice(2)}.py`)
  await writeFile(tmp, source)
  try {
    const { stdout, stderr, code } = await runWithStdin(spawn, 'python3', [tmp], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-python' }
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

async function runLocalCpp(source, stdin, { spawn, execFileAsync, writeFile, unlink, mkdir, path, os }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const dir = path.join(os.tmpdir(), `algodeck-${id}`)
  await mkdir(dir, { recursive: true })
  const src = path.join(dir, 'main.cpp')
  const bin = path.join(dir, 'main')
  await writeFile(src, source)
  try {
    const compile = await execFileAsync('g++', ['-O2', '-std=c++17', src, '-o', bin], { timeout: 15000, maxBuffer: 5 * 1024 * 1024 })
    if (compile.stderr) {
      return { stdout: '', stderr: 'compile error:\n' + compile.stderr, runtime: null, exitCode: 1, backend: 'local-g++' }
    }
    const { stdout, stderr, code } = await runWithStdin(spawn, bin, [], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-g++' }
  } finally {
    await unlink(src).catch(() => {})
    await unlink(bin).catch(() => {})
    await unlink(dir).catch(() => {})
  }
}

// ──────── Test driver generation (browser-safe) ────────

export function buildDriver(langKey, problem, userCode) {
  // The function name is the same in every language — LeetCode uses camelCase
  // universally (twoSum, climbStairs, ...). Users write `def twoSum(...)` in
  // Python or `function twoSum(...)` in JS — we just call whatever they wrote.
  const fn = problem.functionName || 'solution'

  switch (langKey) {
    case 'javascript':
      return `${userCode}
const _args = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
const _result = ${fn}(..._args);
process.stdout.write(JSON.stringify(_result));`

    case 'python':
      return `${userCode}
import sys, json
_args = json.loads(sys.stdin.read().strip())
_result = ${fn}(*_args)
sys.stdout.write(json.dumps(_result))`

    case 'go':
      return `package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
)

${userCode}

func main() {
	raw, _ := bufio.NewReader(os.Stdin).ReadString('\\n')
	var args []json.RawMessage
	if err := json.Unmarshal([]byte(raw), &args); err != nil {
		fmt.Fprintf(os.Stderr, "bad stdin: %v\\n", err)
		os.Exit(1)
	}
	fn := reflect.ValueOf(${fn})
	fnType := fn.Type()
	if fnType.NumIn() != len(args) {
		fmt.Fprintf(os.Stderr, "expected %d args, got %d\\n", fnType.NumIn(), len(args))
		os.Exit(1)
	}
	in := make([]reflect.Value, fnType.NumIn())
	for i := 0; i < fnType.NumIn(); i++ {
		ptr := reflect.New(fnType.In(i))
		if err := json.Unmarshal(args[i], ptr.Interface()); err != nil {
			fmt.Fprintf(os.Stderr, "arg %d: %v\\n", i, err)
			os.Exit(1)
		}
		in[i] = ptr.Elem()
	}
	out := fn.Call(in)
	result := interface{}(nil)
	if len(out) > 0 {
		result = out[0].Interface()
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetEscapeHTML(false)
	enc.Encode(result)
}`

    case 'java':
      return `${userCode}\n// Java execution not wired in this build.`
    case 'cpp':
      return `${userCode}\n// C++ execution requires nlohmann/json. Not wired in this build.`
    default:
      return `${userCode}`
  }
}

/**
 * Run all test cases for a problem against user code.
 */
export async function runTestCases(langKey, problem, userCode) {
  const driver = buildDriver(langKey, problem, userCode)
  const results = []
  for (const tc of problem.testCases) {
    const stdin = JSON.stringify(Object.values(tc.input))
    const res = await executeCode(langKey, driver, stdin, problem)
    let passed = false
    try {
      const actual = JSON.parse((res.stdout || '').trim())
      passed = deepEqual(actual, tc.expected)
    } catch {
      passed = false
    }
    results.push({
      passed,
      stdout: res.stdout,
      stderr: res.stderr,
      runtimeMs: res.runtime,
      hidden: tc.hidden,
      backend: res.backend,
      exitCode: res.exitCode,
    })
  }
  return results
}

function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    return ka.every(k => deepEqual(a[k], b[k]))
  }
  return false
}