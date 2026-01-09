'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Send,
  Eye,
  MessageSquare,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface TimelineEvent {
  id: string
  type: 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'updated'
  title: string
  description?: string
  date: string
  icon?: React.ReactNode
  color?: string
}

interface ApplicationTimelineProps {
  events: TimelineEvent[]
  compact?: boolean
}

export default function ApplicationTimeline({ events, compact = false }: ApplicationTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'applied':
        return <Send className="w-4 h-4" />
      case 'viewed':
        return <Eye className="w-4 h-4" />
      case 'interview':
        return <Calendar className="w-4 h-4" />
      case 'offer':
        return <Award className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'updated':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'applied':
        return {
          bg: 'from-blue-600/20 to-cyan-600/20',
          border: 'border-blue-500/50',
          icon: 'bg-blue-500/20 text-blue-400',
          dot: 'bg-blue-500',
        }
      case 'viewed':
        return {
          bg: 'from-purple-600/20 to-pink-600/20',
          border: 'border-purple-500/50',
          icon: 'bg-purple-500/20 text-purple-400',
          dot: 'bg-purple-500',
        }
      case 'interview':
        return {
          bg: 'from-amber-600/20 to-orange-600/20',
          border: 'border-amber-500/50',
          icon: 'bg-amber-500/20 text-amber-400',
          dot: 'bg-amber-500',
        }
      case 'offer':
        return {
          bg: 'from-emerald-600/20 to-green-600/20',
          border: 'border-emerald-500/50',
          icon: 'bg-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-500',
        }
      case 'accepted':
        return {
          bg: 'from-green-600/20 to-emerald-600/20',
          border: 'border-green-500/50',
          icon: 'bg-green-500/20 text-green-400',
          dot: 'bg-green-500',
        }
      case 'rejected':
        return {
          bg: 'from-red-600/20 to-rose-600/20',
          border: 'border-red-500/50',
          icon: 'bg-red-500/20 text-red-400',
          dot: 'bg-red-500',
        }
      default:
        return {
          bg: 'from-slate-600/20 to-slate-600/20',
          border: 'border-slate-500/50',
          icon: 'bg-slate-500/20 text-slate-400',
          dot: 'bg-slate-500',
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const colors = getEventColor(event.type)
          const icon = event.icon || getEventIcon(event.type)

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-0">
                <div className={`w-12 h-12 rounded-xl ${colors.icon} border border-white/20 flex items-center justify-center backdrop-blur-xl relative z-10`}>
                  {icon}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl ${colors.dot} opacity-20`}
                />
              </div>

              {/* Event Card */}
              <div className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 backdrop-blur-xl hover:scale-[1.02] transition-transform`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-slate-400 text-sm">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Success Indicator */}
      {events.some(e => e.type === 'accepted' || e.type === 'offer') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/50 rounded-xl p-4 backdrop-blur-xl flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Great Progress!</p>
            <p className="text-sm text-emerald-400">You're moving forward with this opportunity</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Compact version for dashboard widgets
export function CompactTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null

  const latestEvents = events.slice(0, 3)

  return (
    <div className="space-y-2">
      {latestEvents.map((event, index) => {
        const colors = {
          applied: 'bg-blue-500',
          viewed: 'bg-purple-500',
          interview: 'bg-amber-500',
          offer: 'bg-emerald-500',
          accepted: 'bg-green-500',
          rejected: 'bg-red-500',
          updated: 'bg-slate-500',
        }[event.type] || 'bg-slate-500'

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className={`w-2 h-2 rounded-full ${colors}`} />
            <span className="text-slate-400 flex-1">{event.title}</span>
            <span className="text-slate-600 text-xs">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </motion.div>
        )
      })}
      {events.length > 3 && (
        <p className="text-xs text-slate-600 text-center pt-2">
          +{events.length - 3} more events
        </p>
      )}
    </div>
  )
}
