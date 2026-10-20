import ReactMarkdown from 'react-markdown'

const ROLE_LABEL = {
  user: 'You',
  model: '🤖 Interviewer',
}

function formatTime(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MessageBubble({ message }) {
  const { role, content, timestamp } = message
  const cssRole = role === 'user' ? 'user' : 'model'

  return (
    <div className={`message ${cssRole}`}>
      <div className="message-label">{ROLE_LABEL[role] ?? role}</div>
      <ReactMarkdown>{content}</ReactMarkdown>
      {timestamp && (
        <div className="message-meta">{formatTime(timestamp)}</div>
      )}
    </div>
  )
}
