'use client'

import { useTheme } from './ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isUltraDark = theme === 'ultra-dark'

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-40 w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-all group shadow-lg"
      title={isUltraDark ? 'Switch to Dark Mode' : 'Switch to Ultra Dark Mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isUltraDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isUltraDark ? (
          <Moon className="w-5 h-5 text-blue-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        )}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
          {isUltraDark ? 'Dark Mode' : 'Ultra Dark'}
          <div className="absolute bottom-full right-4 -mb-1">
            <div className="w-2 h-2 bg-slate-900 border-l border-t border-white/10 transform rotate-45" />
          </div>
        </div>
      </div>
    </button>
  )
}
