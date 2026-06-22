import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// ─────────────────────────────────────────────────────────────────────────
// Monaco-editor runtime patches — MUST run before Monaco loads.
// Loaded eagerly (not lazy) so the polyfills are in place by the time
// Monaco's first module evaluates navigator.clipboard.
// ─────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // Stub Monaco workers — Monaco falls back to synchronous main-thread
  // execution when its workers can't fulfill requests. This avoids the
  // navigator.clipboard.write bug that fires inside Web Worker contexts
  // (workers don't have a clipboard).
  window.MonacoEnvironment = {
    getWorker() {
      const code = `
        self.onmessage = () => {};
        self.postMessage = () => {};
        self.addEventListener = () => {};
        self.removeEventListener = () => {};
      `
      const blob = new Blob([code], { type: 'application/javascript' })
      return new Worker(URL.createObjectURL(blob))
    },
  }
}

if (typeof navigator !== 'undefined' && navigator.clipboard) {
  // Permanent, non-overridable polyfill of navigator.clipboard.write.
  // Monaco calls the legacy async-clipboard API which modern browsers
  // don't ship (they ship writeText instead).
  const writePolyfill = async (data) => {
    try {
      if (data && Array.isArray(data.types) && data.types.includes('text/plain')) {
        const blob = await data.getType('text/plain')
        const text = await blob.text()
        await navigator.clipboard.writeText(text)
      }
    } catch (_) { /* swallow — Monaco degrades gracefully */ }
  }

  // Direct instance property — defineProperty with getter so it cannot be
  // overwritten by subsequent code (Monaco, browser polyfills, etc.).
  let _write = writePolyfill
  try {
    Object.defineProperty(navigator.clipboard, 'write', {
      configurable: true,
      enumerable: true,
      get() { return _write },
      set(v) { _write = typeof v === 'function' ? v : writePolyfill },
    })
  } catch (_) {
    // Fallback: direct assignment
    try { navigator.clipboard.write = writePolyfill } catch (_) {}
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)