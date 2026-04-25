import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiJson, setStoredToken, getStoredToken, ApiError } from './api'
import type { User } from './types'

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>
  logout: () => void
  clearError: () => void
  refreshUser: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const refreshUser = useCallback(async () => {
    const t = getStoredToken()
    if (!t) {
      setState((s) => ({ ...s, user: null, loading: false }))
      return
    }
    try {
      const u = await apiJson<User>('/api/v1/auth/me')
      setState((s) => ({ ...s, user: u, loading: false, error: null }))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setStoredToken(null)
        setState((s) => ({ ...s, user: null, loading: false, error: null }))
      } else {
        setState((s) => ({
          ...s,
          user: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Error',
        }))
      }
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null, loading: true }))
      try {
        const res = await apiJson<{ access_token: string; token_type: string }>(
          '/api/v1/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          }
        )
        setStoredToken(res.access_token)
        await refreshUser()
      } catch (e) {
        setState((s) => ({ ...s, loading: false }))
        throw e
      }
    },
    [refreshUser]
  )

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setState((s) => ({ ...s, error: null, loading: true }))
      try {
        await apiJson<User>('/api/v1/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            display_name: displayName || null,
          }),
        })
        await login(email, password)
      } catch (e) {
        setState((s) => ({ ...s, loading: false }))
        throw e
      }
    },
    [login]
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setState({ user: null, loading: false, error: null })
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      clearError,
      refreshUser,
    }),
    [state.user, state.loading, state.error, login, register, logout, clearError, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
