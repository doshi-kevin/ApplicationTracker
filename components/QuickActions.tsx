'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  FileText,
  Users,
  Building2,
  Calendar,
  Bell,
  Mail,
  Zap,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  href: string
  angle: number
}

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: 'application',
      label: 'New Application',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      href: '/applications',
      angle: 0,
    },
    {
      id: 'contact',
      label: 'New Contact',
      icon: <Users className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500',
      href: '/contacts',
      angle: 45,
    },
    {
      id: 'company',
      label: 'New Company',
      icon: <Building2 className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      href: '/companies',
      angle: 90,
    },
    {
      id: 'event',
      label: 'New Event',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-500',
      href: '/events',
      angle: 135,
    },
    {
      id: 'reminder',
      label: 'New Reminder',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-amber-500 to-yellow-500',
      href: '/reminders',
      angle: 180,
    },
    {
      id: 'template',
      label: 'New Template',
      icon: <Mail className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-500',
      href: '/email-templates',
      angle: 225,
    },
  ]

  const handleActionClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const getPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            />

            {/* Action Buttons */}
            {actions.map((action, index) => {
              const radius = 140
              const pos = getPosition(action.angle - 90, radius) // -90 to start from top

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: pos.x,
                    y: pos.y,
                  }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05,
                  }}
                  className="absolute bottom-0 right-0"
                >
                  <button
                    onClick={() => handleActionClick(action.href)}
                    className={`
                      group relative w-14 h-14 rounded-2xl
                      bg-gradient-to-br ${action.color}
                      shadow-lg hover:shadow-2xl
                      flex items-center justify-center
                      text-white
                      transition-all duration-200
                      hover:scale-110
                      border border-white/20
                    `}
                    title={action.label}
                  >
                    {action.icon}

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                        {action.label}
                        <div className="absolute top-full right-4 -mt-1">
                          <div className="w-2 h-2 bg-slate-900 border-r border-b border-white/10 transform rotate-45" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}

            {/* Center glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-0 right-0 w-64 h-64 -z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-3xl rounded-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-16 h-16 rounded-2xl
          bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600
          shadow-2xl hover:shadow-3xl
          flex items-center justify-center
          text-white
          transition-all duration-300
          border border-white/20
          group
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
            />
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
            />
          </>
        )}
      </motion.button>

      {/* Hint text when closed */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-0 right-20 pointer-events-none hidden lg:block"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
            Quick Actions
            <div className="absolute top-1/2 left-full -translate-y-1/2 -ml-1">
              <div className="w-2 h-2 bg-slate-900 border-r border-t border-white/10 transform rotate-45" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
