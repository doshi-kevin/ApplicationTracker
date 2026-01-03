'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
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

const typeConfig: Record<string, { label: string; color: string }> = {
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INTERVIEW_PREP: { label: 'Interview Prep', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  APPLICATION_DEADLINE: { label: 'Deadline', color: 'bg-red-50 text-red-700 border-red-200' },
  NETWORK: { label: 'Network', color: 'bg-green-50 text-green-700 border-green-200' },
  OTHER: { label: 'Other', color: 'bg-slate-50 text-slate-700 border-slate-200' },
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading reminders...</div>
      </div>
    )
  }

  const pendingReminders = reminders.filter(r => !r.isCompleted)
  const completedReminders = reminders.filter(r => r.isCompleted)
  const overdueCount = pendingReminders.filter(r => isPastDue(r.dueDate)).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Reminders</h1>
                <p className="text-sm text-slate-500 mt-0.5">{reminders.length} total reminders</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Reminder
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-xl font-semibold text-slate-900">{pendingReminders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Overdue</p>
                <p className="text-xl font-semibold text-slate-900">{overdueCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-xl font-semibold text-slate-900">{completedReminders.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <p className="text-slate-500 text-sm">No reminders yet. Stay organized!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pendingReminders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Pending ({pendingReminders.length})</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {pendingReminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group bg-white border rounded-lg p-4 hover:shadow-md transition-all",
                          isPastDue(reminder.dueDate)
                            ? "border-red-200 hover:border-red-300"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={reminder.isCompleted}
                            onChange={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-xs text-slate-600 mb-2">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={cn(
                                  "text-xs font-medium flex items-center gap-1",
                                  isPastDue(reminder.dueDate) ? "text-red-600" : "text-slate-500"
                                )}
                              >
                                <Clock className="w-3 h-3" />
                                {new Date(reminder.dueDate).toLocaleDateString()}
                                {isPastDue(reminder.dueDate) && " (Overdue)"}
                              </span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-md border font-medium",
                                typeConfig[reminder.type]?.color
                              )}>
                                {typeConfig[reminder.type]?.label || reminder.type}
                              </span>
                              {reminder.application && (
                                <span className="text-xs text-slate-500">
                                  {reminder.application.company.name} - {reminder.application.positionTitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(reminder)}
                              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              disabled={deleteId === reminder.id}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </button>
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
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Completed ({completedReminders.length})</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {completedReminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white border border-slate-200 rounded-lg p-4 opacity-60 hover:shadow-md hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={reminder.isCompleted}
                            onChange={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 mb-1 line-through">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-xs text-slate-600 mb-2 line-through">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">
                                {new Date(reminder.dueDate).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(reminder.id)}
                            disabled={deleteId === reminder.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-md disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="e.g., Follow up with recruiter"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      rows={3}
                      placeholder="Add details about this reminder..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Due Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      >
                        {REMINDER_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {typeConfig[type]?.label || type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Related Application (Optional)</label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      <option value="">None - General reminder</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.company.name} - {app.positionTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {editingReminder ? 'Save Changes' : 'Create Reminder'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
