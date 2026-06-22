import { useState } from 'react'
import { runTestCases } from '../lib/piston'
import TestCaseRow from './TestCaseRow'

export default function TestRunner({ problem, language, code }) {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)

  const run = async () => {
    setRunning(true)
    setError(null)
    setResults([])
    setStatusMsg(null)
    // Wire up the exec status callback (read by browser-exec.js Pyodide loader)
    if (typeof window !== 'undefined') {
      window.__algodeckExecStatus = (msg) => setStatusMsg(msg)
    }
    try {
      const out = await runTestCases(language, problem, code)
      setResults(out)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
      setStatusMsg(null)
      if (typeof window !== 'undefined') {
        delete window.__algodeckExecStatus
      }
    }
  }

  const visibleTests = problem.testCases.filter(t => !t.hidden).length
  const allPassed = results.length === problem.testCases.length && results.every(r => r.passed)
  const someVisiblePassed = results.filter((r, i) => !problem.testCases[i].hidden).every(r => r.passed)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={run}
          disabled={running}
          className="bg-accent hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed text-bg font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {running ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-bg border-t-transparent rounded-full" />
              {statusMsg || 'Running...'}
            </>
          ) : (
            <>▶ Run tests ({problem.testCases.length})</>
          )}
        </button>
        {results.length > 0 && (
          <div className={`text-sm font-mono font-semibold ${
            allPassed ? 'text-easy' : someVisiblePassed ? 'text-medium' : 'text-hard'
          }`}>
            {allPassed
              ? '🎉 All passed!'
              : `${results.filter(r => r.passed).length} / ${results.length} passed`}
          </div>
        )}
      </div>

      {error && (
        <div className="text-hard text-sm bg-hard/10 border border-hard/30 rounded-md p-3 font-mono">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <TestCaseRow
              key={i}
              index={i}
              result={r}
              input={problem.testCases[i].input}
              expected={problem.testCases[i].expected}
              hidden={problem.testCases[i].hidden}
            />
          ))}
        </div>
      )}

      {results.length === 0 && !running && (
        <div className="text-text-subtle text-xs font-mono">
          Click <span className="text-accent">Run tests</span> to execute your code against {problem.testCases.length} test cases
          ({visibleTests} visible, {problem.testCases.length - visibleTests} hidden).
        </div>
      )}
    </div>
  )
}