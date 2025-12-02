import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { setAuthTokenGetter, setUnauthorizedHandler } from '@/lib/api/client'
import { login as loginApi, logout as logoutApi } from '@/lib/api/auth'
import {
  clearAuth,
  isTokenExpired,
  loadAuth,
  saveAuth,
  type StoredAuth,
} from '@/lib/auth/tokenStorage'
import type { User } from '@/types/user'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: (options?: { skipRemote?: boolean }) => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = loadAuth()

    if (stored && !isTokenExpired(stored.token)) {
      setUser(stored.user)
      setToken(stored.token)
    } else {
      clearAuth()
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    setAuthTokenGetter(token ? () => token : null)

    return () => {
      setAuthTokenGetter(null)
    }
  }, [token])

  const logout = useCallback(
    async (options?: { skipRemote?: boolean }) => {
      if (!options?.skipRemote) {
        try {
          await logoutApi()
        } catch {
          // Ignore logout API errors
        }
      }

      clearAuth()
      setUser(null)
      setToken(null)
      navigate('/auth/login', { replace: true })
    },
    [navigate]
  )

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout({ skipRemote: true }).catch(() => {
        // Ignore logout errors triggered from unauthorized handler
      })
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi({ email, password })
    const auth: StoredAuth = {
      token: result.token,
      user: result.user,
    }

    saveAuth(auth)
    setUser(result.user)
    setToken(result.token)
  }, [])

  const updateUser = useCallback(
    (nextUser: User) => {
      setUser(nextUser)

      if (token) {
        const auth: StoredAuth = {
          token,
          user: nextUser,
        }

        saveAuth(auth)
      }
    },
    [token]
  )

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return ctx
}

export { AuthProvider, useAuth }
