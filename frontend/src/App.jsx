import { useState } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import API_BASE from './api'
import ControlPanel from './components/ControlPanel'
import ChatWindow from './components/ChatWindow'
import SessionSummary from './components/SessionSummary'

const PHASES = {
  SETUP: 'setup',
  INTERVIEW: 'interview',
  FEEDBACK: 'feedback',
}

const PHASE_LABELS = {
  setup: '⚙️ Setup',
  interview: '🎤 Interview',
  feedback: '📊 Feedback',
}

export default function App() {
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [sessionId, setSessionId] = useState(() => uuidv4())
  const [config, setConfig] = useState({ role: '', topics: [], difficulty: '' })
  const [history, setHistory] = useState([])
  const [feedbackData, setFeedbackData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [error, setError] = useState(null)

  const handleStart = async (interviewConfig) => {
    setError(null)
    setIsLoading(true)
    setConfig(interviewConfig)
    try {
      const response = await axios.post(`${API_BASE}/api/interview/start`, {
        role: interviewConfig.role,
        topics: interviewConfig.topics,
        difficulty: interviewConfig.difficulty,
      })
      const firstMessage = {
        role: 'model',
        content: response.data.message,
        timestamp: new Date().toISOString(),
      }
      setHistory([firstMessage])
      setSessionId(response.data.session_id)
      setPhase(PHASES.INTERVIEW)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading || isFinished) return
    setError(null)

    const userEntry = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString(),
    }
    const updatedHistory = [...history, userEntry]
    setHistory(updatedHistory)
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/api/interview/chat`, {
        session_id: sessionId,
        history: updatedHistory.map(({ role, content }) => ({ role, content })),
        user_message: userMessage.trim(),
        interview_config: {
          role: config.role,
          topics: config.topics,
          difficulty: config.difficulty,
        },
      })

      const aiEntry = {
        role: 'model',
        content: response.data.message,
        timestamp: new Date().toISOString(),
      }
      setHistory([...updatedHistory, aiEntry])

      if (response.data.is_finished) {
        setIsFinished(true)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetFeedback = async () => {
    setError(null)
    setIsLoading(true)
    setPhase(PHASES.FEEDBACK)
    try {
      const response = await axios.post(`${API_BASE}/api/feedback/analyze`, {
        history: history.map(({ role, content }) => ({ role, content })),
        role: config.role,
        topics: config.topics,
      })
      setFeedbackData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewInterview = () => {
    setPhase(PHASES.SETUP)
    setSessionId(uuidv4())
    setConfig({ role: '', topics: [], difficulty: '' })
    setHistory([])
    setFeedbackData(null)
    setIsLoading(false)
    setIsFinished(false)
    setError(null)
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>🤖 AI Interview Agent</h1>
        <p className="tagline">Your personal mock interview coach powered by Google Gemini</p>

        <span className="phase-badge">{PHASE_LABELS[phase]}</span>

        {config.role && (
          <div className="sidebar-section">
            <div><strong>Role:</strong> {config.role}</div>
            {config.difficulty && <div><strong>Level:</strong> {config.difficulty}</div>}
            {config.topics.length > 0 && (
              <div style={{ marginTop: '0.4rem' }}>
                <strong>Topics:</strong>
                <ul style={{ paddingLeft: '1rem', marginTop: '0.2rem' }}>
                  {config.topics.map(t => <li key={t} style={{ fontSize: '0.8rem' }}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {phase === 'interview' && (
          <div className="sidebar-section">
            <strong>Questions:</strong> {Math.floor(history.filter(m => m.role === 'user').length)}/8
          </div>
        )}

        <hr className="sidebar-divider" />

        <div className="sidebar-section" style={{ fontSize: '0.78rem' }}>
          <div>✅ Mock interviews</div>
          <div>🎯 Multiple roles</div>
          <div>📊 Detailed feedback</div>
          <div>🧠 Powered by Gemini</div>
        </div>

        <div className="sidebar-spacer" />

        {phase !== PHASES.SETUP && (
          <button className="btn btn-danger btn-full" onClick={handleNewInterview}>
            🔄 New Interview
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}

        {phase === PHASES.SETUP && (
          <ControlPanel onStart={handleStart} isLoading={isLoading} />
        )}

        {phase === PHASES.INTERVIEW && (
          <ChatWindow
            history={history}
            isLoading={isLoading}
            isFinished={isFinished}
            onSendMessage={handleSendMessage}
            onGetFeedback={handleGetFeedback}
          />
        )}

        {phase === PHASES.FEEDBACK && (
          <SessionSummary
            feedbackData={feedbackData}
            onNewInterview={handleNewInterview}
          />
        )}
      </main>
    </div>
  )
}
