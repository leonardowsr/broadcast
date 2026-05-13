import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { ThemeProvider, createTheme, type PaletteMode } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

interface ThemeContextValue {
  mode: PaletteMode
  toggle: () => void
}

const ThemeCtx = createContext<ThemeContextValue | null>(null)

export function useThemeToggle() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useThemeToggle must be inside ThemeCtxProvider')
  return ctx
}

export function ThemeCtxProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = localStorage.getItem('theme-mode')
    return stored === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? { background: { default: '#121212', paper: '#1e1e1e' } }
            : {}),
        },
      }),
    [mode],
  )

  const ctxValue = useMemo(() => ({ mode, toggle }), [mode, toggle])

  return (
    <ThemeCtx.Provider value={ctxValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  )
}
