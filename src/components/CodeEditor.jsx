import Editor from '@monaco-editor/react'
import { useState } from 'react'

const MONACO_LANG = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
}

export default function CodeEditor({ language, value, onChange, height = '420px' }) {
  const [themeReady, setThemeReady] = useState(false)

  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme('algodeck-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#6e7681',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#7ee787',
        'editor.selectionBackground': '#264f78',
      },
    })
    setThemeReady(true)
  }

  return (
    <div className="border border-border-soft rounded-lg overflow-hidden bg-bg">
      <Editor
        height={height}
        language={MONACO_LANG[language] || 'plaintext'}
        theme={themeReady ? 'algodeck-dark' : 'vs-dark'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        beforeMount={handleBeforeMount}
        options={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          automaticLayout: true,
        }}
      />
    </div>
  )
}