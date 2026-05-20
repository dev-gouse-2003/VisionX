import axios from 'axios'
import toast from 'react-hot-toast'

// Use /api proxy in dev (Vite proxies to localhost:8000)
const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')

        const response = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh })
        const { access } = response.data
        localStorage.setItem('access_token', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api

export const aiService = {
  classify: (text) => api.post('/ai/classify/', { text }),
  detectSpam: (text) => api.post('/ai/spam-detect/', { text }),
  predictDelay: (data) => api.post('/ai/predict-delay/', data),
  askAssistant: (query) => api.post('/ai/assistant/', { query }),
  getSuggestions: () => api.get('/ai/assistant/'),
  analyzeSentiment: (text) => api.post('/ai/sentiment/', { text }),
}

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard/'),
  getMonthlyTrend: (months) => api.get('/analytics/monthly-trend/', { params: { months } }),
  getDepartments: () => api.get('/analytics/departments/'),
  getHeatmap: () => api.get('/analytics/heatmap/'),
  getOfficers: () => api.get('/analytics/officers/'),
  getTransparency: () => api.get('/analytics/transparency/'),
  exportReport: () => api.get('/analytics/export/', { responseType: 'blob' }),
}
