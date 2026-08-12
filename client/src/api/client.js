const DEFAULT_PRODUCTION_API_URL = 'https://server-kappa-three-27.vercel.app/api'
const DEFAULT_DEVELOPMENT_API_URL = 'http://localhost:5000/api'
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_URL = (configuredApiUrl || (import.meta.env.PROD
  ? DEFAULT_PRODUCTION_API_URL
  : DEFAULT_DEVELOPMENT_API_URL)).replace(/\/$/, '')
const TOKEN_KEY = 'dhaka_zoo_token'

if (import.meta.env.PROD && !API_URL.startsWith('https://')) {
  throw new Error('VITE_API_URL must use HTTPS in production.')
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed')
    error.status = response.status
    error.details = payload.details
    throw error
  }

  return payload
}

export { API_URL, TOKEN_KEY }
