import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      setStudent(res.data.student)
    } catch {
      localStorage.removeItem('sf_token')
      delete api.defaults.headers.Authorization
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('sf_token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(user)
    if (user.role === 'student') {
      const me = await api.get('/auth/me')
      setStudent(me.data.student)
    }
    return user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, user } = res.data
    localStorage.setItem('sf_token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(user)
    if (user.role === 'student') {
      const me = await api.get('/auth/me')
      setStudent(me.data.student)
    }
    return user
  }

  const logout = () => {
    localStorage.removeItem('sf_token')
    delete api.defaults.headers.Authorization
    setUser(null)
    setStudent(null)
  }

  const refreshStudent = async () => {
    const me = await api.get('/auth/me')
    setStudent(me.data.student)
    return me.data.student
  }

  return (
    <AuthContext.Provider value={{ user, student, loading, login, register, logout, refreshStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
