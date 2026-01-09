'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'ultra-dark' | 'bright'

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
    } else {
      applyTheme('dark')
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    // Remove all theme classes first
    root.classList.remove('ultra-dark', 'bright')

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
    } else if (newTheme === 'bright') {
      root.style.setProperty('--bg-primary', '#f8fafc')
      root.style.setProperty('--bg-secondary', '#f1f5f9')
      root.style.setProperty('--bg-tertiary', '#e2e8f0')
      root.style.setProperty('--bg-elevated', '#ffffff')
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#475569')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)')
      root.classList.add('bright')
    } else {
      // Default dark mode
      root.style.setProperty('--bg-primary', '#0a0a0a')
      root.style.setProperty('--bg-secondary', '#111111')
      root.style.setProperty('--bg-tertiary', '#1a1a1a')
      root.style.setProperty('--bg-elevated', '#222222')
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    // Cycle through: dark -> ultra-dark -> bright -> dark
    let newTheme: Theme
    if (theme === 'dark') newTheme = 'ultra-dark'
    else if (theme === 'ultra-dark') newTheme = 'bright'
    else newTheme = 'dark'
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
