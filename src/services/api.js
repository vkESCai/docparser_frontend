import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
})

// Response interceptor for unified error shape
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail || err.message || 'Unknown error'
    return Promise.reject(new Error(detail))
  }
)

export const api = {
  health: () => client.get('/health', { timeout: 3000 }),

  parse: (file, onProgress) => {
    const fd = new FormData()
    fd.append('file', file)
    return client.post('/parse', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
  },

  parseBatch: (files) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    return client.post('/parse/batch', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default client
