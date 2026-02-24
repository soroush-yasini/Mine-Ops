import axios from 'axios'

// In production (Docker/nginx), use relative URLs so nginx proxies to backend.
// In local dev (npm run dev), use VITE_API_BASE_URL for the Vite dev proxy.
const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  : ''

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
