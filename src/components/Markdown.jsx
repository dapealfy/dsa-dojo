import ReactMarkdown from 'react-markdown'

export default function Markdown({ children, className = '' }) {
  return (
    <div className={`prose-dsa text-text ${className}`}>
      <ReactMarkdown>{children || ''}</ReactMarkdown>
    </div>
  )
}