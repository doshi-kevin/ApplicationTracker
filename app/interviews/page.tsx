'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Calendar, Clock, Video, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interview {
  id: string
  round: number
  title: string
  interviewDate: string
  duration?: number
  location?: string
  status: string
  notes?: string
  application: {
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

const INTERVIEW_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar },
  COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  RESCHEDULED: { label: 'Rescheduled', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)

  const [formData, setFormData] = useState({
    applicationId: '',
    round: 1,
    title: '',
    interviewDate: '',
    duration: 60,
    location: '',
    status: 'SCHEDULED',
    notes: '',
  })

  useEffect(() => {
    fetchInterviews()
    fetchApplications()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interviews')
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error('Error fetching interviews:', error)
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
      const url = editingInterview ? `/api/interviews/${editingInterview.id}` : '/api/interviews'
      const method = editingInterview ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interviewDate: new Date(formData.interviewDate).toISOString(),
          duration: formData.duration || null,
        }),
      })

      if (response.ok) {
        await fetchInterviews()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving interview:', error)
    }
  }

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchInterviews()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchInterviews()
      }
    } catch (error) {
      console.error('Error deleting interview:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingInterview(null)
    setShowModal(true)
  }

  const openEditModal = (interview: Interview) => {
    setEditingInterview(interview)
    setFormData({
      applicationId: interview.application.id,
      round: interview.round,
      title: interview.title,
      interviewDate: new Date(interview.interviewDate).toISOString().slice(0, 16),
      duration: interview.duration || 60,
      location: interview.location || '',
      status: interview.status,
      notes: interview.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingInterview(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      applicationId: '',
      round: 1,
      title: '',
      interviewDate: '',
      duration: 60,
      location: '',
      status: 'SCHEDULED',
      notes: '',
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading interviews...</div>
      </div>
    )
  }

  const upcomingInterviews = interviews.filter(i => isUpcoming(i.interviewDate) && i.status === 'SCHEDULED')
  const pastInterviews = interviews.filter(i => !isUpcoming(i.interviewDate) || i.status !== 'SCHEDULED')
  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length
  const cancelledCount = interviews.filter(i => i.status === 'CANCELLED').length

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
                <h1 className="text-xl font-semibold text-slate-900">Interviews</h1>
                <p className="text-sm text-slate-500 mt-0.5">{interviews.length} total interviews</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Interview
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-semibold text-slate-900">{interviews.length}</p>
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
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Upcoming</p>
                <p className="text-xl font-semibold text-slate-900">{upcomingInterviews.length}</p>
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
                <p className="text-xl font-semibold text-slate-900">{completedCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cancelled</p>
                <p className="text-xl font-semibold text-slate-900">{cancelledCount}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interviews List */}
        {interviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <p className="text-slate-500 text-sm">No interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingInterviews.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Upcoming ({upcomingInterviews.length})</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {upcomingInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-slate-900">{interview.application.company.name}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-600">{interview.application.positionTitle}</span>
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-2">{interview.title} - Round {interview.round}</h3>
                            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(interview.interviewDate).toLocaleString()}
                              </div>
                              {interview.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {interview.duration} min
                                </div>
                              )}
                              {interview.location && (
                                <div className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  {interview.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                onClick={() => openEditModal(interview)}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(interview.id)}
                                disabled={deleteId === interview.id}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Past */}
            {pastInterviews.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Past ({pastInterviews.length})</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {pastInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-slate-900">{interview.application.company.name}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-600">{interview.application.positionTitle}</span>
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-2">{interview.title} - Round {interview.round}</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs text-slate-500">
                                {new Date(interview.interviewDate).toLocaleDateString()}
                              </span>
                              <select
                                value={interview.status}
                                onChange={(e) => handleQuickStatusUpdate(interview.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "text-xs px-2 py-1 rounded-md border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900",
                                  statusConfig[interview.status]?.color
                                )}
                              >
                                {INTERVIEW_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {statusConfig[status]?.label || status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(interview)}
                              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(interview.id)}
                              disabled={deleteId === interview.id}
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
                  {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Application *</label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    >
                      <option value="">Select an application</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.company.name} - {app.positionTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Round *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.round}
                        onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      >
                        {INTERVIEW_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusConfig[status]?.label || status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Interview Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="e.g., Technical Interview, Behavioral Round"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.interviewDate}
                      onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Duration (minutes)</label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="Zoom, Office, Phone, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      rows={3}
                      placeholder="Add any notes or preparation points..."
                    />
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
                    {editingInterview ? 'Save Changes' : 'Schedule Interview'}
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
