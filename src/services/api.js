import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (formData) => {
    const params = new URLSearchParams()
    params.append('username', formData.phone)
    params.append('password', formData.password)
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me/get'),
}

export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  getMy: () => api.get('/products/my/'),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const ordersAPI = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/', data),
  getMy: () => api.get('/orders/my/'),
  getMySales: () => api.get('/orders/my/sales/'),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status?new_status=${status}`),
  delete: (id) => api.delete(`/orders/${id}`),
}

export default api

