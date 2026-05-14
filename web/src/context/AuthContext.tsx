import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getIdTokenResult,
  type User,
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../config/firebase'

type EnsureTenantResult = {
  tenantId: string
}

interface AuthContextValue {
  user: User | null
  tenantId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!active) return
      setLoading(true)
      setUser(u)
      if (!u) {
        setTenantId(null)
        setLoading(false)
        return
      }
      try {
        let token = await getIdTokenResult(u)
        let resolvedTenantId = typeof token.claims.tenantId === 'string' ? token.claims.tenantId : null
        if (typeof token.claims.tenantId !== 'string') {
          const ensureTenant = httpsCallable(functions, 'ensureTenant')
          const result = await ensureTenant()
          resolvedTenantId = (result.data as EnsureTenantResult).tenantId
          await u.getIdToken(true)
          token = await getIdTokenResult(u)
          resolvedTenantId = typeof token.claims.tenantId === 'string' ? token.claims.tenantId : resolvedTenantId
        }
        if (!active) return
        setTenantId(resolvedTenantId)
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
      unsub()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({ user, tenantId, loading, login, register, logout }),
    [user, tenantId, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
