// Central API config — reads VITE_API_URL in production (Render),
// falls back to '' for local dev (Vite proxy handles it).
// Strip any trailing slash to prevent double-slash URLs.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default API_BASE
