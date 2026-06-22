import { useState } from 'react'

export default function TestCaseRow({ index, result, input, expected, hidden }) {
  const { passed, stdout, stderr, runtimeMs } = result || { passed: null }
  const [open, setOpen] = useState(false)

  return (
    <div className={`rounded-md border ${
      passed === true ? 'border-easy/40 bg-easy/5' :
      passed === false ? 'border-hard/40 bg-hard/5' :
      'border-border-soft bg-bg-soft'
    }`}>
      <button
        onClick={() => !hidden && setOpen(o => !o)}
        disabled={hidden}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">
            {passed === true ? '✅' : passed === false ? '❌' : '⏳'}
          </span>
          <span className="font-mono">Test {index + 1}</span>
          {hidden && <span className="text-xs text-text-subtle">(hidden)</span>}
          {runtimeMs !== null && runtimeMs !== undefined && (
            <span className="text-xs text-text-subtle font-mono">{runtimeMs}ms</span>
          )}
        </div>
        {!hidden && <span className="text-text-subtle text-xs">{open ? '▾' : '▸'}</span>}
      </button>
      {open && !hidden && (
        <div className="border-t border-border-soft px-3 py-2 text-xs font-mono space-y-2">
          {input !== undefined && (
            <div>
              <div className="text-text-subtle mb-0.5">input:</div>
              <pre className="text-text-muted whitespace-pre-wrap break-all">{JSON.stringify(input)}</pre>
            </div>
          )}
          {expected !== undefined && (
            <div>
              <div className="text-text-subtle mb-0.5">expected:</div>
              <pre className="text-easy whitespace-pre-wrap break-all">{JSON.stringify(expected)}</pre>
            </div>
          )}
          {stdout && (
            <div>
              <div className="text-text-subtle mb-0.5">stdout:</div>
              <pre className="text-text whitespace-pre-wrap break-all">{stdout}</pre>
            </div>
          )}
          {stderr && (
            <div>
              <div className="text-text-subtle mb-0.5">stderr:</div>
              <pre className="text-hard whitespace-pre-wrap break-all">{stderr}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}