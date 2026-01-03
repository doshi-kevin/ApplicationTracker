'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Reminder {
  id: string
  title: string
  description?: string
  dueDate: string
  isCompleted: boolean
  type: string
  application?: {
    id: string
    positionTitle: string
    company: {
      name: string
    }
  }
}

interface Application {
  id: string
  positionTitle: string
  company: {
    id: string
    name: string
  }
}

const REMINDER_TYPES = ['FOLLOW_UP', 'INTERVIEW_PREP', 'APPLICATION_DEADLINE', 'NETWORK', 'OTHER']

const typeConfig: Record<string, { label: string; gradient: string; textColor: string }> = {
  FOLLOW_UP: { label: 'Follow Up', gradient: 'from-blue-500 to-blue-700', textColor: 'text-blue-300' },
  INTERVIEW_PREP: { label: 'Interview Prep', gradient: 'from-purple-500 to-purple-700', textColor: 'text-purple-300' },
  APPLICATION_DEADLINE: { label: 'Deadline', gradient: 'from-red-500 to-red-700', textColor: 'text-red-300' },
  NETWORK: { label: 'Network', gradient: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-300' },
  OTHER: { label: 'Other', gradient: 'from-slate-500 to-slate-700', textColor: 'text-slate-300' },
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'FOLLOW_UP',
    applicationId: '',
  })

  useEffect(() => {
    fetchReminders()
    fetchApplications()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()
      setReminders(data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      setApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
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
          dueDate: new Date(formData.dueDate).toISOString(),
          applicationId: formData.applicationId || null,
        }),
      })

      if (response.ok) {
        await fetchReminders()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    }
  }

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      })

      if (response.ok) {
        await fetchReminders()
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchReminders()
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingReminder(null)
    setShowModal(true)
  }

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      dueDate: new Date(reminder.dueDate).toISOString().slice(0, 16),
      type: reminder.type,
      applicationId: reminder.application?.id || '',
    })
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
      type: 'FOLLOW_UP',
      applicationId: '',
    })
  }

  const isPastDue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Loading reminders...
        </motion.div>
      </div>
    )
  }

  const pendingReminders = reminders.filter(r => !r.isCompleted)
  const completedReminders = reminders.filter(r => r.isCompleted)
  const overdueCount = pendingReminders.filter(r => isPastDue(r.dueDate)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  Reminders
                </h1>
                <p className="text-slate-400 text-sm mt-1">{reminders.length} total reminders</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Reminder
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Pending</p>
                <p className="text-4xl font-bold text-white">{pendingReminders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Overdue</p>
                <p className="text-4xl font-bold text-red-400">{overdueCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Completed</p>
                <p className="text-4xl font-bold text-emerald-400">{completedReminders.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <p className="text-slate-400 text-lg">No reminders yet. Stay organized!</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Pending */}
            {pendingReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pending ({pendingReminders.length})
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {pendingReminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 transition-all",
                          isPastDue(reminder.dueDate)
                            ? "border-red-500/50 hover:border-red-500/70 shadow-lg shadow-red-500/20"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <motion.input
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="checkbox"
                            checked={reminder.isCompleted}
                            onChange={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                            className="mt-1 w-5 h-5 rounded-lg border-2 border-white/30 bg-white/10 cursor-pointer accent-emerald-500"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-2">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-sm text-slate-400 mb-3">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={cn(
                                  "text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg",
                                  isPastDue(reminder.dueDate)
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-white/5 text-slate-300 border border-white/10"
                                )}
                              >
                                <Clock className="w-4 h-4" />
                                {new Date(reminder.dueDate).toLocaleDateString()}
                                {isPastDue(reminder.dueDate) && " (Overdue)"}
                              </span>
                              <span className={cn(
                                "text-sm px-3 py-1.5 rounded-lg font-semibold bg-gradient-to-r text-white border-2 border-transparent",
                                typeConfig[reminder.type]?.gradient
                              )}>
                                {typeConfig[reminder.type]?.label || reminder.type}
                              </span>
                              {reminder.application && (
                                <span className="text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                  {reminder.application.company.name} - {reminder.application.positionTitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal(reminder)}
                              className="p-2.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(reminder.id)}
                              disabled={deleteId === reminder.id}
                              className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Completed */}
            {completedReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Completed ({completedReminders.length})
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {completedReminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 opacity-70 hover:opacity-100 hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <motion.input
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="checkbox"
                            checked={reminder.isCompleted}
                            onChange={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                            className="mt-1 w-5 h-5 rounded-lg border-2 border-white/30 bg-emerald-500/20 cursor-pointer accent-emerald-500"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-2 line-through opacity-70">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-sm text-slate-400 mb-3 line-through opacity-70">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                {new Date(reminder.dueDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed
                              </span>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(reminder.id)}
                            disabled={deleteId === reminder.id}
                            className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
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
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  {editingReminder ? 'Edit Reminder' : 'New Reminder'}
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
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      placeholder="e.g., Follow up with recruiter"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      rows={3}
                      placeholder="Add details about this reminder..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Due Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {REMINDER_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-slate-900 text-white">
                            {typeConfig[type]?.label || type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Related Application (Optional)</label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="bg-slate-900 text-white">None - General reminder</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id} className="bg-slate-900 text-white">
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
                    className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    {editingReminder ? 'Save Changes' : 'Create Reminder'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
