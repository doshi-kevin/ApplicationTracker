'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'ultra-dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('app-theme') as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'ultra-dark') {
      root.style.setProperty('--bg-primary', '#000000')
      root.style.setProperty('--bg-secondary', '#0a0a0a')
      root.style.setProperty('--bg-tertiary', '#141414')
      root.style.setProperty('--bg-elevated', '#1a1a1a')
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.05)')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#a0a0a0')
      root.style.setProperty('--glass-bg', 'rgba(10, 10, 10, 0.4)')
      root.classList.add('ultra-dark')
    } else {
      root.style.setProperty('--bg-primary', '#0a0a0a')
      root.style.setProperty('--bg-secondary', '#111111')
      root.style.setProperty('--bg-tertiary', '#1a1a1a')
      root.style.setProperty('--bg-elevated', '#222222')
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)')
      root.classList.remove('ultra-dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'ultra-dark' : 'dark'
    setTheme(newTheme)
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="bg-[#0a0a0a] min-h-screen" />
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
