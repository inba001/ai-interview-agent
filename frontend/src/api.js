// Central API config — reads VITE_API_URL in production (Render),
// falls back to '' for local dev (Vite proxy handles it)
const API_BASE = import.meta.env.VITE_API_URL || ''

export default API_BASE
