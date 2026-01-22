'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ChevronRight, CheckCircle2, Circle, Clock,
  Calendar, AlertCircle, Sparkles, Trash2, Edit2,
  ChevronDown, Flag, Target, Zap, ListTodo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Application {
  id: string
  positionTitle: string
  company: {
    id: string
    name: string
  }
}

interface Reminder {
  id: string
  title: string
  description?: string
  dueDate: string
  isCompleted: boolean
  completedAt?: string
  type: string
  applicationId?: string
  application?: Application
  createdAt: string
  updatedAt: string
}

type ViewMode = 'board' | 'list'
type FilterType = 'all' | 'overdue' | 'today' | 'upcoming'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [expandedReminder, setExpandedReminder] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'TODO',
    applicationId: '',
  })

  const reminderTypes = [
    { value: 'TODO', label: 'To-Do', icon: ListTodo, gradient: 'from-blue-500 to-cyan-500' },
    { value: 'FOLLOW_UP', label: 'Follow Up', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { value: 'DEADLINE', label: 'Deadline', icon: AlertCircle, gradient: 'from-red-500 to-pink-500' },
    { value: 'INTERVIEW_PREP', label: 'Interview Prep', icon: Target, gradient: 'from-purple-500 to-violet-500' },
    { value: 'OTHER', label: 'Other', icon: Flag, gradient: 'from-emerald-500 to-teal-500' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [remindersRes, applicationsRes] = await Promise.all([
        fetch('/api/reminders'),
        fetch('/api/applications')
      ])
      const remindersData = await remindersRes.json()
      const applicationsData = await applicationsRes.json()
      setReminders(remindersData)
      setApplications(applicationsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingReminder ? `/api/reminders/${editingReminder.id}` : '/api/reminders'
      const method = editingReminder ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          applicationId: formData.applicationId || null,
        }),
      })

      if (response.ok) {
        await fetchData()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    }
  }

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCompleted: !reminder.isCompleted,
          completedAt: !reminder.isCompleted ? new Date().toISOString() : null,
        }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error toggling reminder:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingReminder(null)
    setShowModal(true)
  }

  const openEditModal = (reminder: Reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      dueDate: new Date(reminder.dueDate).toISOString().slice(0, 16),
      type: reminder.type,
      applicationId: reminder.applicationId || '',
    })
    setEditingReminder(reminder)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingReminder(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      type: 'TODO',
      applicationId: '',
    })
  }

  const getTypeConfig = (type: string) => {
    return reminderTypes.find(t => t.value === type) || reminderTypes[0]
  }

  const isOverdue = (dueDate: string, isCompleted: boolean) => {
    return !isCompleted && new Date(dueDate) < new Date()
  }

  const isToday = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due.toDateString() === today.toDateString()
  }

  const categorizedReminders = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    return {
      overdue: reminders.filter(r => !r.isCompleted && new Date(r.dueDate) < startOfToday),
      today: reminders.filter(r => !r.isCompleted && new Date(r.dueDate) >= startOfToday && new Date(r.dueDate) < endOfToday),
      upcoming: reminders.filter(r => !r.isCompleted && new Date(r.dueDate) >= endOfToday),
      completed: reminders.filter(r => r.isCompleted),
    }
  }, [reminders])

  const filteredReminders = useMemo(() => {
    if (filterType === 'all') return reminders.filter(r => !r.isCompleted)
    if (filterType === 'overdue') return categorizedReminders.overdue
    if (filterType === 'today') return categorizedReminders.today
    if (filterType === 'upcoming') return categorizedReminders.upcoming
    return reminders.filter(r => !r.isCompleted)
  }, [reminders, categorizedReminders, filterType])

  const stats = {
    overdue: categorizedReminders.overdue.length,
    today: categorizedReminders.today.length,
    upcoming: categorizedReminders.upcoming.length,
  }

  const ReminderCard = ({ reminder, showCategory = false }: { reminder: Reminder, showCategory?: boolean }) => {
    const typeConfig = getTypeConfig(reminder.type)
    const TypeIcon = typeConfig.icon
    const overdueStatus = isOverdue(reminder.dueDate, reminder.isCompleted)
    const todayStatus = isToday(reminder.dueDate)
    const expanded = expandedReminder === reminder.id

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "bg-white/5 backdrop-blur-sm border rounded-xl p-4 hover:bg-white/8 transition-all cursor-pointer group",
          reminder.isCompleted ? "border-green-500/20" : overdueStatus ? "border-red-500/40 shadow-lg shadow-red-500/10" : todayStatus ? "border-amber-500/40 shadow-lg shadow-amber-500/10" : "border-white/10"
        )}
        onClick={() => setExpandedReminder(expanded ? null : reminder.id)}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleComplete(reminder)
            }}
            className="mt-0.5 flex-shrink-0"
          >
            {reminder.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title and Type */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-white truncate",
                reminder.isCompleted && "line-through text-slate-500"
              )}>
                {reminder.title}
              </h3>
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                `bg-gradient-to-r ${typeConfig.gradient} bg-opacity-20`
              )}>
                <TypeIcon className="w-3 h-3" />
                <span>{typeConfig.label}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-4 text-xs">
              <div className={cn(
                "flex items-center gap-1",
                overdueStatus ? "text-red-400 font-medium" : todayStatus ? "text-amber-400 font-medium" : "text-slate-400"
              )}>
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(reminder.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {overdueStatus && <span className="ml-1 text-red-400">(Overdue)</span>}
                {todayStatus && <span className="ml-1 text-amber-400">(Today)</span>}
              </div>

              {reminder.application && (
                <div className="text-slate-400 truncate">
                  {reminder.application.company.name} - {reminder.application.positionTitle}
                </div>
              )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  {reminder.description && (
                    <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">
                      {reminder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(reminder)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(reminder.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-500 transition-transform flex-shrink-0",
              expanded && "rotate-180"
            )}
          />
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading reminders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Zap className="w-8 h-8 text-emerald-400" />
                  Reminders & To-Dos
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {stats.overdue + stats.today + stats.upcoming} active tasks
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Reminder
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Overdue', count: stats.overdue, gradient: 'from-red-600 to-pink-600', icon: AlertCircle, filter: 'overdue' as FilterType },
              { label: 'Today', count: stats.today, gradient: 'from-amber-600 to-orange-600', icon: Zap, filter: 'today' as FilterType },
              { label: 'Upcoming', count: stats.upcoming, gradient: 'from-blue-600 to-cyan-600', icon: Clock, filter: 'upcoming' as FilterType },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <motion.button
                  key={stat.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterType(filterType === stat.filter ? 'all' : stat.filter)}
                  className={cn(
                    "relative overflow-hidden rounded-xl p-4 text-left transition-all",
                    filterType === stat.filter
                      ? `bg-gradient-to-br ${stat.gradient} shadow-lg`
                      : "bg-white/5 hover:bg-white/8 border border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("w-5 h-5", filterType === stat.filter ? "text-white" : "text-slate-400")} />
                    <span className={cn("text-2xl font-bold", filterType === stat.filter ? "text-white" : "text-white")}>
                      {stat.count}
                    </span>
                  </div>
                  <p className={cn("text-sm font-medium", filterType === stat.filter ? "text-white/90" : "text-slate-400")}>
                    {stat.label}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {filterType === 'all' ? 'All Reminders' :
             filterType === 'overdue' ? 'Overdue' :
             filterType === 'today' ? 'Due Today' :
             'Upcoming'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                viewMode === 'board' ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                viewMode === 'list' ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              List
            </button>
          </div>
        </div>

        {/* Board View */}
        {viewMode === 'board' && filterType === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Overdue', items: categorizedReminders.overdue, gradient: 'from-red-500/20 to-pink-500/20', icon: AlertCircle },
              { title: 'Today', items: categorizedReminders.today, gradient: 'from-amber-500/20 to-orange-500/20', icon: Zap },
              { title: 'Upcoming', items: categorizedReminders.upcoming, gradient: 'from-blue-500/20 to-cyan-500/20', icon: Clock },
            ].map((column) => {
              const Icon = column.icon
              return (
                <div key={column.title} className="flex flex-col">
                  <div className={cn(
                    "bg-gradient-to-br border border-white/10 rounded-xl p-4 mb-4",
                    column.gradient
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-white" />
                      <h3 className="font-semibold text-white">{column.title}</h3>
                    </div>
                    <p className="text-sm text-slate-300">{column.items.length} items</p>
                  </div>
                  <div className="space-y-3 flex-1">
                    <AnimatePresence>
                      {column.items.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} />
                      ))}
                    </AnimatePresence>
                    {column.items.length === 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <p className="text-slate-500 text-sm">No items</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {(viewMode === 'list' || filterType !== 'all') && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} showCategory />
              ))}
            </AnimatePresence>
            {filteredReminders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
              >
                <ListTodo className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">No reminders found</p>
                <p className="text-slate-500 text-sm">Create your first reminder to get started!</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                  {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                      placeholder="e.g., Follow up with recruiter, Prepare for interview"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                      rows={3}
                      placeholder="Add any additional details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Due Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {reminderTypes.map((type) => {
                        const TypeIcon = type.icon
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value })}
                            className={cn(
                              "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
                              formData.type === type.value
                                ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg`
                                : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                            )}
                          >
                            <TypeIcon className="w-4 h-4" />
                            <span className="text-sm">{type.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Link to Application (Optional)
                    </label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">None</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id} className="bg-slate-900">
                          {app.company.name} - {app.positionTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    {editingReminder ? 'Save Changes' : 'Add Reminder'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
