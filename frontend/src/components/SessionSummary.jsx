import { useState } from 'react'

function getScoreClass(score) {
  if (score >= 7) return 'good'
  if (score >= 4) return 'ok'
  return 'poor'
}

function getProgressClass(score) {
  if (score >= 7) return 'good'
  if (score >= 4) return 'ok'
  return 'poor'
}

function AccordionItem({ question, betterAnswer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="accordion">
      <div
        className={`accordion-header ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="accordion-icon">▼</span>
      </div>
      {open && (
        <div className="accordion-body">
          <strong>💡 Model Answer</strong>
          {betterAnswer}
        </div>
      )}
    </div>
  )
}

export default function SessionSummary({ feedbackData, onNewInterview }) {
  if (!feedbackData) {
    return (
      <div className="main-content">
        <div className="spinner-container">
          <div className="spinner" />
          <p>🧠 Analyzing your interview… This may take a moment.</p>
        </div>
      </div>
    )
  }

  const {
    overall_score,
    strengths,
    improvements,
    topic_scores,
    sample_answers,
    recommendation,
  } = feedbackData

  const scoreClass = getScoreClass(overall_score)

  return (
    <div className="session-summary">
      <h2>📊 Interview Feedback Report</h2>
      <p className="summary-subtitle">Here's how you performed in your mock interview</p>

      {/* Overall Score */}
      <div className={`score-circle ${scoreClass}`}>
        {overall_score}/10
      </div>

      {/* Strengths */}
      {strengths?.length > 0 && (
        <div className="feedback-section">
          <h3>✅ Strengths</h3>
          <ul className="feedback-list">
            {strengths.map((s, i) => (
              <li key={i}><span>✅</span><span>{s}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {improvements?.length > 0 && (
        <div className="feedback-section">
          <h3>🔧 Areas for Improvement</h3>
          <ul className="feedback-list">
            {improvements.map((imp, i) => (
              <li key={i}><span>🔧</span><span>{imp}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Topic Scores */}
      {topic_scores && Object.keys(topic_scores).length > 0 && (
        <div className="feedback-section">
          <h3>📈 Topic Scores</h3>
          {Object.entries(topic_scores).map(([topic, score]) => (
            <div className="topic-row" key={topic}>
              <div className="topic-row-header">
                <span>{topic}</span>
                <span>{score}/10</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${getProgressClass(score)}`}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sample Answers */}
      {sample_answers?.length > 0 && (
        <div className="feedback-section">
          <h3>💬 Sample Better Answers</h3>
          {sample_answers.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.question}
              betterAnswer={item.better_answer}
            />
          ))}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="feedback-section">
          <h3>🎯 Recommendation</h3>
          <div className="recommendation-box">
            {recommendation}
          </div>
        </div>
      )}

      {/* New Interview Button */}
      <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
        <button
          className="btn btn-primary"
          onClick={onNewInterview}
          style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
        >
          🎯 Start New Interview
        </button>
      </div>
    </div>
  )
}
