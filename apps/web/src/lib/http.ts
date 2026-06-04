import axios from 'axios'

const YGO_API_BASE_URL = import.meta.env.VITE_YGO_API_BASE_URL ?? ''

if (import.meta.env.DEV && !YGO_API_BASE_URL) {
  console.warn(
    '[YGO API] VITE_YGO_API_BASE_URL is not defined. ' +
      'API calls will fail until this variable is configured. ' +
      'See .env.example for setup instructions.'
  )
}

export const ygoApiClient = axios.create({
  baseURL: YGO_API_BASE_URL,
  timeout: 6_000,
  headers: {
    Accept: 'application/json',
  },
})

ygoApiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 503) {
        console.warn(
          '[YGO API] Service temporarily unavailable (503). Using fallback if available.'
        )
      } else if (status === 400) {
        console.warn('[YGO API] Bad request (400):', error.response?.data)
      }
    }
    return Promise.reject(error)
  }
)
