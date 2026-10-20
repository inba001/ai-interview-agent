import { useState } from 'react'

const TOPICS = [
  'DSA & Algorithms',
  'System Design',
  'Machine Learning',
  'Deep Learning',
  'LLM & GenAI',
  'React & Frontend',
  'Python',
  'SQL & Databases',
  'API Design',
  'Behavioral',
]

const ROLES = [
  'Full Stack Developer',
  'AI Engineer',
  'MLOps Engineer',
  'Data Scientist',
  'Backend Developer',
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function ControlPanel({ onStart, isLoading }) {
  const [role, setRole] = useState(ROLES[0])
  const [selectedTopics, setSelectedTopics] = useState(['DSA & Algorithms', 'System Design'])
  const [difficulty, setDifficulty] = useState('Medium')

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSubmit = () => {
    if (!role || selectedTopics.length === 0 || !difficulty) return
    onStart({ role, topics: selectedTopics, difficulty })
  }

  const isValid = role && selectedTopics.length > 0 && difficulty

  return (
    <div className="control-panel">
      <div className="control-panel-card">
        <h2>🚀 Start Your Mock Interview</h2>
        <p className="subtitle">Configure your interview session and practice with an AI interviewer</p>

        {/* Role Selection */}
        <div className="form-group">
          <label htmlFor="role-select">Target Role</label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Topics Selection */}
        <div className="form-group">
          <label>Topics to Cover <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({selectedTopics.length} selected)</span></label>
          <div className="topics-grid">
            {TOPICS.map((topic) => {
              const checked = selectedTopics.includes(topic)
              return (
                <label
                  key={topic}
                  className={`topic-checkbox ${checked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic)}
                  />
                  {topic}
                </label>
              )
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="form-group">
          <label>Difficulty Level</label>
          <div className="difficulty-group">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={`difficulty-option ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'} {d}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          style={{ marginTop: '0.5rem', padding: '0.8rem' }}
        >
          {isLoading ? '⏳ Starting Interview...' : '🎤 Start Interview'}
        </button>

        {selectedTopics.length === 0 && (
          <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
            Please select at least one topic.
          </p>
        )}
      </div>
    </div>
  )
}
