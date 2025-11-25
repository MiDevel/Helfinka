import type { ReactNode } from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const THEME_STORAGE_KEY = 'helfinka-theme'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)

  return stored === 'light' ? 'light' : 'dark'
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)

  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return ctx
}

export { ThemeProvider, useTheme }
