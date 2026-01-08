'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Companies', href: '/companies' },
  { name: 'Applications', href: '/applications' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Events', href: '/events' },
  { name: 'Reminders', href: '/reminders' },
  { name: 'Resumes', href: '/resumes' },
  { name: 'Learning', href: '/learning' },
  { name: 'Email Templates', href: '/email-templates' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#0f0f0f] border-r border-[#2a2a2a]
          flex flex-col
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Header */}
        <div className="p-6 pt-20 lg:pt-6">
          <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Your career companion</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-[#3b82f6] text-white'
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="text-xs text-gray-500">
            <p>Job Application Tracker</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
