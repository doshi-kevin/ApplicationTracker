'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Building2,
  FileText,
  Users,
  Calendar,
  Bell,
  FileEdit,
  GraduationCap,
  Mail,
  BarChart3,
  Sparkles,
  BookOpen
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-blue-400' },
  { name: 'My Daily To-Do', href: '/daily-todo', icon: CheckSquare, color: 'text-purple-400' },
  { name: 'Companies', href: '/companies', icon: Building2, color: 'text-emerald-400' },
  { name: 'Applications', href: '/applications', icon: FileText, color: 'text-orange-400' },
  { name: 'Contacts', href: '/contacts', icon: Users, color: 'text-pink-400' },
  { name: 'Events', href: '/events', icon: Calendar, color: 'text-cyan-400' },
  { name: 'Reminders', href: '/reminders', icon: Bell, color: 'text-amber-400' },
  { name: 'Resumes', href: '/resumes', icon: FileEdit, color: 'text-violet-400' },
  { name: 'Resources', href: '/resources', icon: BookOpen, color: 'text-teal-400' },
  { name: 'Learning', href: '/learning', icon: GraduationCap, color: 'text-indigo-400' },
  { name: 'Email Templates', href: '/email-templates', icon: Mail, color: 'text-rose-400' },
]

const bottomNavigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-green-400' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when route changes
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay - Only on mobile when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static top-0 left-0 h-full z-40
          w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-white/10
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:h-screen
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Job Tracker
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Your career companion</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</p>
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10 shadow-lg'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                <span>{item.name}</span>
              </Link>
            )
          })}

          <div className="px-3 mb-2 mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Insights</p>
          </div>
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-white border border-white/10 shadow-lg'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-600 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs font-semibold text-white">All Systems Active</p>
            </div>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
