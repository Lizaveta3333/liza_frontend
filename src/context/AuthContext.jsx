import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }
      const response = await authAPI.getMe()
      console.log('Load user response:', response)
      if (response.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (phone, password) => {
    try {
      const response = await authAPI.login({ phone, password })
      console.log('Login response:', response)
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token)
        }
        // Wait for user to be loaded before returning
        await loadUser()
        // Verify user was actually loaded
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('Token was not saved')
        }
        return response.data
      } else {
        console.error('No access_token in response:', response.data)
        throw new Error('Invalid response from server - no access token')
      }
    } catch (error) {
      console.error('Login error:', error)
      // Clear tokens on error
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw error
    }
  }

  const signup = async (userData) => {
    const response = await authAPI.signup(userData)
    return response.data
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

