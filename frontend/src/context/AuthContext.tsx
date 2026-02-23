import React, { createContext, useContext, useState, useCallback } from 'react'
import apiClient from '../api/client'

interface User {
  username: string
  full_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await apiClient.post('/auth/login', formData)
    const { access_token, role } = response.data
    const userData = { username, full_name: username, role }
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!token,
      isManager: user?.role === 'manager'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
