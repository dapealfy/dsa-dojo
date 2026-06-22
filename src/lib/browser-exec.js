// Browser-side code execution: Pyodide (Python) + sandboxed JS via Worker.
// Loaded lazily on first use. No backend needed — runs entirely in the user's browser.
// Pyodide is ~10MB compressed, served from jsDelivr CDN on first run, cached forever.

const PYODIDE_VERSION = '0.26.2'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let _pyodidePromise = null
let _pyodideReady = false

/**
 * Lazy-load Pyodide. Subsequent calls return the same promise.
 * Streams `loading: <message>` to the onStatus callback for UI feedback.
 */
export function loadPyodide(onStatus) {
  if (_pyodidePromise) return _pyodidePromise
  _pyodidePromise = (async () => {
    if (typeof window === 'undefined') throw new Error('Pyodide only works in a browser')
    onStatus?.('Loading Python runtime (~10 MB, first run only)…')
    // Inject pyodide.js script tag (only once)
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = PYODIDE_CDN + 'pyodide.js'
        s.onload = resolve
        s.onerror = () => reject(new Error('Failed to load Pyodide from CDN — check your network.'))
        document.head.appendChild(s)
      })
    }
    onStatus?.('Initializing Python interpreter…')
    const py = await window.loadPyodide({ indexURL: PYODIDE_CDN })
    _pyodideReady = true
    onStatus?.('Python ready.')
    return py
  })()
  return _pyodidePromise
}

/**
 * Run Python code in Pyodide. The driver is expected to be self-contained —
 * test args are inlined as a JSON literal by buildBrowserDriver, so there's
 * no need to fiddle with sys.stdin. We just set stdout/stderr capture and run.
 */
export async function runPythonInBrowser(code, onStatus) {
  const py = await loadPyodide(onStatus)
  let stdout = '', stderr = ''
  py.setStdout({ batched: (s) => { stdout += s + '\n' } })
  py.setStderr({ batched: (s) => { stderr += s + '\n' } })
  try {
    await py.runPythonAsync(code)
  } catch (e) {
    stderr += (stderr ? '\n' : '') + (e.message || String(e))
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 1 }
  }
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 }
}

// ──────────── JavaScript execution in a sandboxed Web Worker ────────────
// Why a Worker? `new Function()` on the main thread can hang the page on infinite
// loops. A Worker can be terminated. We use Blob + URL.createObjectURL for a
// self-contained worker with no external file.

const JS_WORKER_SRC = `
self.onmessage = async (e) => {
  const { code } = e.data
  let stdout = '', stderr = '', exitCode = 0
  const log = (...args) => stdout += args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') + '\\n'
  const origConsole = { log: console.log, error: console.error, warn: console.warn }
  console.log = log; console.error = (...a) => stderr += a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ') + '\\n'
  console.warn = log
  try {
    // Wrap user code so top-level return works (driver uses it)
    const wrapped = new Function('console', code + '\\n;return typeof _result !== "undefined" ? _result : undefined;')
    const result = wrapped(console)
    if (result !== undefined) stdout += JSON.stringify(result)
  } catch (e) {
    stderr += (stderr ? '\\n' : '') + (e.message || String(e))
  }
  console.log = origConsole.log; console.error = origConsole.error; console.warn = origConsole.warn
  self.postMessage({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode })
}
`

let _jsWorkerURL = null
function getJsWorkerURL() {
  if (_jsWorkerURL) return _jsWorkerURL
  const blob = new Blob([JS_WORKER_SRC], { type: 'application/javascript' })
  _jsWorkerURL = URL.createObjectURL(blob)
  return _jsWorkerURL
}

/**
 * Run JS in a sandboxed Web Worker with a timeout kill switch.
 * Same shape as runPythonInBrowser: { stdout, stderr, exitCode }.
 */
export function runJsInBrowser(code, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ stdout: '', stderr: 'JS execution only available in browser', exitCode: -1 })
      return
    }
    const worker = new Worker(getJsWorkerURL())
    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      worker.terminate()
      resolve({ stdout: '', stderr: `timeout after ${timeoutMs}ms — likely infinite loop`, exitCode: 124 })
    }, timeoutMs)
    worker.onmessage = (e) => {
      if (done) return
      done = true
      clearTimeout(timer)
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = (e) => {
      if (done) return
      done = true
      clearTimeout(timer)
      worker.terminate()
      resolve({ stdout: '', stderr: e.message || 'worker error', exitCode: 1 })
    }
    worker.postMessage({ code })
  })
}

/**
 * Build a browser-friendly version of the test driver.
 * Mirrors the Node drivers in piston.js but inlines the test args directly
 * as a literal — no sys.stdin / _stdin handoff needed (Pyodide namespace
 * quirks make that unreliable, and the JS worker never had a _stdin binding).
 * @param {Array} testArgs  positional args for the user's function
 */
export function buildBrowserDriver(langKey, problem, userCode, testArgs = []) {
  // The function name is camelCase (LeetCode convention) and identical in every
  // language. Users write `def twoSum(...)` in Python or `function twoSum(...)`
  // in JS — we just call whatever they wrote.
  const fn = problem.functionName || 'solution'
  // Double-encode: outer JSON.stringify makes it a valid Python/JS literal
  // when interpolated. For Python, json.loads of that string yields the array.
  const argsLiteral = JSON.stringify(testArgs)

  switch (langKey) {
    case 'javascript':
      return `${userCode}
try {
  const _args = ${argsLiteral};
  const _result = ${fn}(..._args);
  console.log(JSON.stringify(_result));
} catch (e) {
  console.error(e.message || String(e));
  throw e;
}
`
    case 'python':
      return `${userCode}
import json
_args = json.loads(${JSON.stringify(argsLiteral)})
_result = ${fn}(*_args)
print(json.dumps(_result))
`
    default:
      return userCode
  }
}

export const isBrowserExecAvailable = (langKey) => langKey === 'javascript' || langKey === 'python'
