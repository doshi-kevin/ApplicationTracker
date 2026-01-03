'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Calendar, Clock, Video, CheckCircle2, XCircle, AlertCircle, Sparkles, Building2 } from 'lucide-react'
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

const statusConfig: Record<string, { label: string; gradient: string; icon: any }> = {
  SCHEDULED: { label: 'Scheduled', gradient: 'from-blue-500 to-blue-700', icon: Calendar },
  COMPLETED: { label: 'Completed', gradient: 'from-green-500 to-green-700', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', gradient: 'from-red-500 to-red-700', icon: XCircle },
  RESCHEDULED: { label: 'Rescheduled', gradient: 'from-amber-500 to-orange-600', icon: AlertCircle },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Loading interviews...
        </motion.div>
      </div>
    )
  }

  const upcomingInterviews = interviews.filter(i => isUpcoming(i.interviewDate) && i.status === 'SCHEDULED')
  const pastInterviews = interviews.filter(i => !isUpcoming(i.interviewDate) || i.status !== 'SCHEDULED')
  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length
  const cancelledCount = interviews.filter(i => i.status === 'CANCELLED').length

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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  Interviews
                </h1>
                <p className="text-slate-400 mt-1">{interviews.length} total interviews</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Schedule Interview
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: interviews.length, gradient: 'from-slate-600 to-slate-800', icon: Calendar },
            { label: 'Upcoming', count: upcomingInterviews.length, gradient: 'from-blue-500 to-blue-700', icon: Clock },
            { label: 'Completed', count: completedCount, gradient: 'from-green-500 to-green-700', icon: CheckCircle2 },
            { label: 'Cancelled', count: cancelledCount, gradient: 'from-red-500 to-red-700', icon: XCircle },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
            >
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", stat.gradient)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Interviews List */}
        {interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No interviews scheduled</h3>
            <p className="text-slate-400 mb-6">Schedule your first interview</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Interview
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingInterviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Upcoming ({upcomingInterviews.length})
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {upcomingInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {interview.title} - Round {interview.round}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Building2 className="w-4 h-4" />
                                  <span>{interview.application.company.name}</span>
                                  <span>•</span>
                                  <span className="text-sm">{interview.application.positionTitle}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap text-sm">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Calendar className="w-4 h-4" />
                                {new Date(interview.interviewDate).toLocaleString()}
                              </div>
                              {interview.duration && (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Clock className="w-4 h-4" />
                                  {interview.duration} min
                                </div>
                              )}
                              {interview.location && (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Video className="w-4 h-4" />
                                  {interview.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal(interview)}
                              className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(interview.id)}
                              disabled={deleteId === interview.id}
                              className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center text-red-400 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
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
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Past ({pastInterviews.length})
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {pastInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {interview.title} - Round {interview.round}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Building2 className="w-4 h-4" />
                                  <span>{interview.application.company.name}</span>
                                  <span>•</span>
                                  <span className="text-sm">{interview.application.positionTitle}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm text-slate-400">
                                {new Date(interview.interviewDate).toLocaleDateString()}
                              </span>
                              <select
                                value={interview.status}
                                onChange={(e) => handleQuickStatusUpdate(interview.id, e.target.value)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all bg-gradient-to-r text-white",
                                  `${statusConfig[interview.status]?.gradient} border-transparent hover:scale-105`
                                )}
                              >
                                {INTERVIEW_STATUSES.map((status) => (
                                  <option key={status} value={status} className="bg-slate-900">
                                    {statusConfig[status]?.label || status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal(interview)}
                              className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(interview.id)}
                              disabled={deleteId === interview.id}
                              className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center text-red-400 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white">
                  {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Application *</label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" className="bg-slate-900">Select an application</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id} className="bg-slate-900">
                          {app.company.name} - {app.positionTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Round *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.round}
                        onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {INTERVIEW_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-slate-900">
                            {statusConfig[status]?.label || status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Interview Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Technical Interview, Behavioral Round"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.interviewDate}
                      onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Duration (minutes)</label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Zoom, Office, Phone, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Add any notes or preparation points..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    {editingInterview ? 'Save Changes' : 'Schedule Interview'}
                  </button>
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
