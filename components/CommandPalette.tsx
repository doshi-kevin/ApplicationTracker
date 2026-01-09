'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
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
  Plus,
  Command,
  ArrowRight,
  Clock,
  Zap,
  Settings,
  Moon,
  Sun
} from 'lucide-react'

interface Command {
  id: string
  label: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'create' | 'actions' | 'settings'
}

interface CommandPaletteProps {
  onCreateApplication?: () => void
  onCreateContact?: () => void
  onCreateCompany?: () => void
  onCreateEvent?: () => void
  onCreateReminder?: () => void
  onCreateTemplate?: () => void
  onToggleDarkMode?: () => void
}

export default function CommandPalette({
  onCreateApplication,
  onCreateContact,
  onCreateCompany,
  onCreateEvent,
  onCreateReminder,
  onCreateTemplate,
  onToggleDarkMode,
}: CommandPaletteProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      shortcut: 'G then D',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/'),
      category: 'navigation',
    },
    {
      id: 'nav-todo',
      label: 'Go to Daily To-Do',
      shortcut: 'G then T',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => router.push('/daily-todo'),
      category: 'navigation',
    },
    {
      id: 'nav-companies',
      label: 'Go to Companies',
      shortcut: 'G then C',
      icon: <Building2 className="w-4 h-4" />,
      action: () => router.push('/companies'),
      category: 'navigation',
    },
    {
      id: 'nav-applications',
      label: 'Go to Applications',
      shortcut: 'G then A',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/applications'),
      category: 'navigation',
    },
    {
      id: 'nav-contacts',
      label: 'Go to Contacts',
      shortcut: 'G then N',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/contacts'),
      category: 'navigation',
    },
    {
      id: 'nav-events',
      label: 'Go to Events',
      shortcut: 'G then E',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/events'),
      category: 'navigation',
    },
    {
      id: 'nav-reminders',
      label: 'Go to Reminders',
      shortcut: 'G then R',
      icon: <Bell className="w-4 h-4" />,
      action: () => router.push('/reminders'),
      category: 'navigation',
    },
    {
      id: 'nav-resumes',
      label: 'Go to Resumes',
      shortcut: 'G then S',
      icon: <FileEdit className="w-4 h-4" />,
      action: () => router.push('/resumes'),
      category: 'navigation',
    },
    {
      id: 'nav-learning',
      label: 'Go to Learning',
      shortcut: 'G then L',
      icon: <GraduationCap className="w-4 h-4" />,
      action: () => router.push('/learning'),
      category: 'navigation',
    },
    {
      id: 'nav-email',
      label: 'Go to Email Templates',
      shortcut: 'G then M',
      icon: <Mail className="w-4 h-4" />,
      action: () => router.push('/email-templates'),
      category: 'navigation',
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      shortcut: 'G then Y',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => router.push('/analytics'),
      category: 'navigation',
    },
    // Create Actions
    {
      id: 'create-application',
      label: 'Create New Application',
      shortcut: 'N then A',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateApplication?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    {
      id: 'create-contact',
      label: 'Create New Contact',
      shortcut: 'N then C',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateContact?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    {
      id: 'create-company',
      label: 'Create New Company',
      shortcut: 'N then O',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateCompany?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    {
      id: 'create-event',
      label: 'Create New Event',
      shortcut: 'N then E',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateEvent?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    {
      id: 'create-reminder',
      label: 'Create New Reminder',
      shortcut: 'N then R',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateReminder?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    {
      id: 'create-template',
      label: 'Create New Email Template',
      shortcut: 'N then T',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onCreateTemplate?.()
        setIsOpen(false)
      },
      category: 'create',
    },
    // Settings & Actions
    {
      id: 'toggle-dark-mode',
      label: 'Toggle Ultra Dark Mode',
      shortcut: 'Ctrl+Shift+D',
      icon: <Moon className="w-4 h-4" />,
      action: () => {
        onToggleDarkMode?.()
        setIsOpen(false)
      },
      category: 'settings',
    },
  ]

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  const categoryLabels = {
    navigation: 'Navigation',
    create: 'Create New',
    actions: 'Quick Actions',
    settings: 'Settings',
  }

  const categoryIcons = {
    navigation: <Zap className="w-4 h-4" />,
    create: <Plus className="w-4 h-4" />,
    actions: <Clock className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setSearch('')
        setSelectedIndex(0)
      }

      // ESC to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
        setSelectedIndex(0)
      }

      // Arrow navigation when palette is open
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          filteredCommands[selectedIndex]?.action()
          setIsOpen(false)
          setSearch('')
          setSelectedIndex(0)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />

            {/* Command Palette */}
            <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl bg-slate-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Search Input */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type a command or search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-lg"
                      autoFocus
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-slate-400">
                      <Command className="w-3 h-3" />K
                    </kbd>
                  </div>
                </div>

                {/* Commands List */}
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {filteredCommands.length === 0 ? (
                    <div className="p-12 text-center">
                      <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No commands found</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {Object.entries(groupedCommands).map(([category, cmds]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-2 px-3 py-2">
                            {categoryIcons[category as keyof typeof categoryIcons]}
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </h3>
                          </div>
                          <div className="space-y-1">
                            {cmds.map((command, idx) => {
                              const globalIndex = filteredCommands.indexOf(command)
                              const isSelected = globalIndex === selectedIndex
                              return (
                                <button
                                  key={command.id}
                                  onClick={() => {
                                    command.action()
                                    setIsOpen(false)
                                    setSearch('')
                                  }}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                                    ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }
                                  `}
                                >
                                  <div
                                    className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center
                                    ${isSelected ? 'bg-white/10' : 'bg-white/5'}
                                  `}
                                  >
                                    {command.icon}
                                  </div>
                                  <span className="flex-1 text-sm font-medium">
                                    {command.label}
                                  </span>
                                  {command.shortcut && (
                                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-slate-400">
                                      {command.shortcut}
                                    </kbd>
                                  )}
                                  {isSelected && (
                                    <ArrowRight className="w-4 h-4 text-blue-400" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded">↓</kbd>
                        Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded">Enter</kbd>
                        Select
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded">ESC</kbd>
                        Close
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Floating hint when closed */}
    </>
  )
}
