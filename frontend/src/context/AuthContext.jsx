
import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }

    try {
      return JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password
    })

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    setUser(data.user)

    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: Boolean(user)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
