// Local execution backend with optional Piston fallback.
// As of 2026-02-15, the public Piston API at emkc.org is whitelist-only
// (returns 401 to all public requests). So we run locally when possible:
//   - javascript → node
//   - python     → python3
//   - cpp        → g++ (compile to /tmp, then run binary)
//   - java, go   → requires Piston (currently unavailable)

import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import os from 'os'

const execFileAsync = promisify(execFile)

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

export const LANG_MAP = {
  javascript: { language: 'javascript', version: '18.15.0', filename: 'main.js', label: 'JavaScript', localRunner: 'node' },
  python:     { language: 'python',     version: '3.10.0', filename: 'main.py', label: 'Python',     localRunner: 'python3' },
  java:       { language: 'java',       version: '15.0.2', filename: 'Main.java', label: 'Java',    localRunner: null },
  cpp:        { language: 'c++',        version: '10.2.0', filename: 'main.cpp', label: 'C++',       localRunner: 'g++' },
  go:         { language: 'go',         version: '1.16.2', filename: 'main.go', label: 'Go',         localRunner: null },
}

export const LANG_KEYS = Object.keys(LANG_MAP)

// Track whether Piston auth is working. Once it returns 401, fall back forever.
let pistonAvailable = true

async function tryPiston(cfg, source, stdin) {
  if (!pistonAvailable) return null
  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: cfg.language,
        version: cfg.version,
        files: [{ name: cfg.filename, content: source }],
        stdin,
        run_timeout: 5000,
        compile_timeout: 10000,
      }),
    })
    if (res.status === 401) {
      pistonAvailable = false
      return null
    }
    if (!res.ok) return null
    const data = await res.json()
    return {
      stdout: data.run?.stdout ?? '',
      stderr: data.run?.stderr ?? '',
      runtime: data.runtime ?? data.run?.runtime ?? null,
      exitCode: data.run?.code ?? 0,
      error: data.message,
      backend: 'piston',
    }
  } catch {
    return null
  }
}

// In PRoot Termux the `input` option on execFile doesn't deliver stdin.
// Use spawn + manual write instead.
function runWithStdin(cmd, args, stdin, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''
    let resolved = false
    const finish = (code) => {
      if (resolved) return
      resolved = true
      resolve({ stdout, stderr, code })
    }
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      stderr += (stderr ? '\n' : '') + 'timeout after ' + timeoutMs + 'ms'
      finish(124)
    }, timeoutMs)
    child.stdout.on('data', d => { stdout += d.toString() })
    child.stderr.on('data', d => { stderr += d.toString() })
    child.on('error', e => {
      clearTimeout(timer)
      stderr += (stderr ? '\n' : '') + e.message
      finish(-1)
    })
    child.on('close', code => {
      clearTimeout(timer)
      finish(code ?? 0)
    })
    if (stdin) child.stdin.write(stdin)
    child.stdin.end()
  })
}

async function runLocalJs(source, stdin) {
  const tmp = path.join(os.tmpdir(), `algodeck-${Date.now()}-${Math.random().toString(36).slice(2)}.js`)
  await writeFile(tmp, source)
  try {
    const { stdout, stderr, code } = await runWithStdin('node', [tmp], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-node' }
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

async function runLocalPy(source, stdin) {
  const tmp = path.join(os.tmpdir(), `algodeck-${Date.now()}-${Math.random().toString(36).slice(2)}.py`)
  await writeFile(tmp, source)
  try {
    const { stdout, stderr, code } = await runWithStdin('python3', [tmp], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-python' }
  } finally {
    await unlink(tmp).catch(() => {})
  }
}

async function runLocalCpp(source, stdin) {
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
    const { stdout, stderr, code } = await runWithStdin(bin, [], stdin)
    return { stdout, stderr, runtime: null, exitCode: code, backend: 'local-g++' }
  } finally {
    await unlink(src).catch(() => {})
    await unlink(bin).catch(() => {})
    await unlink(dir).catch(() => {})
  }
}

const LOCAL_RUNNERS = {
  javascript: runLocalJs,
  python: runLocalPy,
  cpp: runLocalCpp,
}

/**
 * Execute source code. Local-first, Piston-fallback.
 * @returns {Promise<{stdout, stderr, runtime, exitCode, error?, backend}>}
 */
export async function executeCode(langKey, source, stdin = '') {
  const cfg = LANG_MAP[langKey]
  if (!cfg) throw new Error(`Unknown language: ${langKey}`)

  // Local first
  const local = LOCAL_RUNNERS[langKey]
  if (local) {
    try {
      return await local(source, stdin)
    } catch (e) {
      return { stdout: '', stderr: e.message || String(e), runtime: null, exitCode: -1, backend: `local-${langKey}` }
    }
  }

  // Fall back to Piston for Go / Java
  if (pistonAvailable) {
    const r = await tryPiston(cfg, source, stdin)
    if (r) return r
  }

  return {
    stdout: '',
    stderr: `${cfg.label} execution requires the Piston API, which is currently whitelist-only (public access was closed on 2026-02-15). Install ${cfg.label} locally or self-host Piston (https://github.com/engineer-man/piston) to enable.`,
    runtime: null,
    exitCode: -1,
    backend: 'none',
  }
}

/**
 * Build a test driver that wraps the user's solution and runs against
 * a single test case. stdin contains positional JSON-encoded test args
 * (i.e. the values of the test case's `input` object, in key order).
 * Driver reads stdin, calls the user's function by name, prints JSON result.
 *
 * Requires `problem.functionName` (added to all 137 problems).
 */
function camelToSnake(s) {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
}

export function buildDriver(langKey, problem, userCode) {
  const fn = problem.functionName || 'solution'
  const pyFn = camelToSnake(fn)

  switch (langKey) {
    case 'javascript':
      // stdin is a JSON array of positional args
      return `${userCode}
const _args = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
const _result = ${fn}(..._args);
process.stdout.write(JSON.stringify(_result));`

    case 'python':
      return `${userCode}
import sys, json
_args = json.loads(sys.stdin.read().strip())
_result = ${pyFn}(*_args)
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
      return `${userCode}\n// C++ execution requires nlohmann/json (apt install nlohmann-json3-dev). Not wired in this build.`
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
    const res = await executeCode(langKey, driver, stdin)
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