'use client'

import { useTheme } from './ThemeProvider'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const getThemeConfig = () => {
    switch (theme) {
      case 'ultra-dark':
        return {
          icon: <Moon className="w-5 h-5 text-indigo-400" />,
          label: 'Ultra Dark',
          nextLabel: 'Bright'
        }
      case 'bright':
        return {
          icon: <Sun className="w-5 h-5 text-amber-400" />,
          label: 'Bright',
          nextLabel: 'Dark'
        }
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-blue-400" />,
          label: 'Dark',
          nextLabel: 'Ultra Dark'
        }
    }
  }

  const config = getThemeConfig()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-40 w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-all group shadow-lg"
      title={`Switch to ${config.nextLabel} Mode`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {config.icon}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
          {config.label} → {config.nextLabel}
          <div className="absolute bottom-full right-4 -mb-1">
            <div className="w-2 h-2 bg-slate-900 border-l border-t border-white/10 transform rotate-45" />
          </div>
        </div>
      </div>
    </button>
  )
}
