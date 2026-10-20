import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ history, isLoading, isFinished, onSendMessage, onGetFeedback }) {
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom whenever history or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, isLoading])

  const handleSubmit = () => {
    const msg = inputValue.trim()
    if (!msg || isLoading || isFinished) return
    onSendMessage(msg)
    setInputValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      {/* Messages */}
      <div className="chat-window" role="log" aria-live="polite">
        <div className="message system">
          🎤 Interview session started. Answer each question to the best of your ability.
        </div>

        {history.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {isLoading && (
          <div className="typing-indicator" aria-label="Interviewer is typing">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Finished Banner */}
      {isFinished && (
        <div className="feedback-banner">
          <p>🎉 Interview complete! Ready to see your personalized feedback report?</p>
          <button
            className="btn btn-primary"
            onClick={onGetFeedback}
            disabled={isLoading}
          >
            📊 Get Feedback Report
          </button>
        </div>
      )}

      {/* Input Area */}
      {!isFinished && (
        <div className="input-area">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Waiting for interviewer...' : 'Type your answer… (Enter to send, Shift+Enter for new line)'}
            rows={2}
            disabled={isLoading || isFinished}
            aria-label="Your answer"
          />
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || isFinished || !inputValue.trim()}
            aria-label="Send answer"
          >
            Send
          </button>
        </div>
      )}
    </>
  )
}
