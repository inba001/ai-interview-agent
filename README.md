# 🤖 AI Interview Prep Agent

An AI-powered mock interview platform for software engineers and AI practitioners. Practice technical interviews with a realistic AI interviewer powered by Google Gemini, then receive a detailed personalized feedback report.

---

## ✨ Features

- 🎤 **Realistic Mock Interviews** — Conducts full 8-question technical interviews, one question at a time
- 🎯 **Multiple Target Roles** — Full Stack Developer, AI Engineer, MLOps Engineer, Data Scientist, Backend Developer
- 📚 **Topic Selection** — Choose from DSA, System Design, ML, Deep Learning, LLMs, React, Python, SQL, API Design, and Behavioral
- 📊 **Detailed Feedback Reports** — Overall score, strengths, improvement areas, per-topic scores, and model answers
- 💬 **Real-time Chat Interface** — Smooth, responsive chat UI with markdown rendering
- 📱 **Mobile-Friendly** — Responsive design that works on all screen sizes

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python, FastAPI, Uvicorn          |
| Frontend  | React 18, Vite, Axios             |
| AI        | Google Gemini 1.5 Flash           |
| SDK       | `google-generativeai`             |
| Deploy    | Render.com (free tier)            |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Backend Setup

```bash
cd backend

# Copy and fill in your API key
cp .env.example .env
# Edit .env: GEMINI_API_KEY=your_actual_key_here

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive API docs.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will open at `http://localhost:5173`.

---

## 🔑 Environment Variables

| Variable        | Description                          | Required |
|-----------------|--------------------------------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key          | ✅ Yes   |

---

## ☁️ Deployment to Render.com

1. **Fork** this repository to your GitHub account.
2. Go to [render.com](https://render.com) and sign in.
3. Click **New +** → **Blueprint** and connect your forked repo.
4. Render will detect `render.yaml` and configure both services automatically.
5. Set the **`GEMINI_API_KEY`** environment variable in the backend service settings.
6. Click **Apply** — both services will build and deploy.

> **Note:** On the free tier, the backend may spin down after inactivity. The first request after sleep may take ~30 seconds.

---

## 📖 How to Use

1. **Configure** — Select your target role, topics to cover, and difficulty level.
2. **Interview** — Answer the AI interviewer's questions naturally. The session covers ~8 questions.
3. **Finish** — When the interviewer says the session is complete, click **Get Feedback Report**.
4. **Review** — Study your score, strengths, weaknesses, topic breakdown, and model answers.
5. **Repeat** — Start a new interview to track your improvement over time.

---

## 📁 Project Structure

```
ai-interview-agent/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   └── routers/
│       ├── __init__.py
│       ├── interview.py         # Interview session endpoints
│       └── feedback.py          # Feedback analysis endpoints
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root component & state management
│       ├── index.css            # Global styles (dark theme)
│       └── components/
│           ├── ChatWindow.jsx   # Interview chat interface
│           ├── MessageBubble.jsx # Individual message component
│           ├── ControlPanel.jsx  # Interview setup form
│           └── SessionSummary.jsx # Feedback report display
├── render.yaml                  # Render.com deployment config
├── .gitignore
└── README.md
```

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
