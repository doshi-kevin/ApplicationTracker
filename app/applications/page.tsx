'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Building2,
  Briefcase,
  Calendar,
  Search,
  X,
  Edit2,
  Trash2,
  Check,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Upload,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
}

interface Contact {
  id: string
  name: string
  company: {
    id: string
    name: string
  }
}

interface Application {
  id: string
  positionTitle: string
  description?: string
  jobPostingUrl?: string
  status: string
  appliedDate: string
  company: {
    id: string
    name: string
  }
  isReferred: boolean
  referredById?: string
  referredByContact?: {
    id: string
    name: string
  }
  resumePath: string
  coverLetterPath?: string
}

const APPLICATION_STATUSES = [
  'NOT_APPLIED',
  'APPLIED',
  'IN_REVIEW',
  'INTERVIEW_SCHEDULED',
  'OFFER_RECEIVED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  NOT_APPLIED: { label: 'Not Applied', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock },
  APPLIED: { label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
  IN_REVIEW: { label: 'In Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Calendar },
  OFFER_RECEIVED: { label: 'Offer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: TrendingUp },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200', icon: Check },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: X },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [companyFormData, setCompanyFormData] = useState({ name: '' })
  const [companySearch, setCompanySearch] = useState('')
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyId: '',
    positionTitle: '',
    description: '',
    jobPostingUrl: '',
    status: 'APPLIED',
    isReferred: false,
    referredById: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appsRes, companiesRes, contactsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/companies'),
        fetch('/api/contacts'),
      ])

      const appsData = await appsRes.json()
      const companiesData = await companiesRes.json()
      const contactsData = await contactsRes.json()

      setApplications(appsData)
      setCompanies(companiesData)
      setContacts(contactsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyFormData.name.trim()) return

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyFormData.name.trim() }),
      })

      if (response.ok) {
        const newCompany = await response.json()
        setCompanies([...companies, newCompany])
        setFormData({ ...formData, companyId: newCompany.id })
        setCompanyFormData({ name: '' })
        setShowCompanyModal(false)
      }
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany || !companyFormData.name.trim()) return

    try {
      const response = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyFormData.name.trim() }),
      })

      if (response.ok) {
        await fetchData()
        setCompanyFormData({ name: '' })
        setEditingCompany(null)
        setShowCompanyModal(false)
      }
    } catch (error) {
      console.error('Error updating company:', error)
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    try {
      setDeletingCompanyId(companyId)
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCompanies(companies.filter(c => c.id !== companyId))
        if (formData.companyId === companyId) {
          setFormData({ ...formData, companyId: '' })
        }
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting company:', error)
    } finally {
      setDeletingCompanyId(null)
    }
  }

  const openCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
      setCompanyFormData({ name: company.name })
    } else {
      setEditingCompany(null)
      setCompanyFormData({ name: '' })
    }
    setShowCompanyModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeFile) return

    setSubmitting(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('companyId', formData.companyId)
      formDataObj.append('positionTitle', formData.positionTitle)
      formDataObj.append('description', formData.description)
      formDataObj.append('jobPostingUrl', formData.jobPostingUrl)
      formDataObj.append('status', formData.status)
      formDataObj.append('isReferred', formData.isReferred.toString())
      if (formData.referredById) {
        formDataObj.append('referredById', formData.referredById)
      }
      formDataObj.append('resume', resumeFile)
      if (coverLetterFile) {
        formDataObj.append('coverLetter', coverLetterFile)
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataObj,
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating application:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingApp) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${editingApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: formData.companyId,
          positionTitle: formData.positionTitle,
          description: formData.description,
          jobPostingUrl: formData.jobPostingUrl,
          status: formData.status,
          isReferred: formData.isReferred,
          referredById: formData.referredById || null,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        setEditingApp(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingApp(null)
    setShowModal(true)
  }

  const openEditModal = (app: Application) => {
    setEditingApp(app)
    setFormData({
      companyId: app.company.id,
      positionTitle: app.positionTitle,
      description: app.description || '',
      jobPostingUrl: app.jobPostingUrl || '',
      status: app.status,
      isReferred: app.isReferred,
      referredById: app.referredByContact?.id || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      companyId: '',
      positionTitle: '',
      description: '',
      jobPostingUrl: '',
      status: 'APPLIED',
      isReferred: false,
      referredById: '',
    })
    setResumeFile(null)
    setCoverLetterFile(null)
    setCompanySearch('')
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Total', value: applications.length, icon: Target, color: 'text-slate-700' },
    { label: 'In Review', value: applications.filter(a => a.status === 'IN_REVIEW').length, icon: Clock, color: 'text-amber-600' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length, icon: Calendar, color: 'text-purple-600' },
    { label: 'Offers', value: applications.filter(a => a.status === 'OFFER_RECEIVED').length, icon: TrendingUp, color: 'text-emerald-600' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Applications</h1>
                <p className="text-sm text-slate-500 mt-0.5">{applications.length} total applications</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Application
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center"
          >
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No applications yet</h3>
            <p className="text-sm text-slate-500 mb-6">Get started by creating your first application</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {applications.map((app, index) => {
                const config = statusConfig[app.status]
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate">{app.positionTitle}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{app.company.name}</span>
                              <span className="text-slate-300">•</span>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        {app.isReferred && app.referredByContact && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-700">
                            <Check className="w-3 h-3" />
                            Referred by {app.referredByContact.name}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusUpdate(app.id, e.target.value)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium border rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all",
                            config.color
                          )}
                        >
                          {APPLICATION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status].label}
                            </option>
                          ))}
                        </select>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(app)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(app.id)}
                          disabled={deleteId === app.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false)
              setEditingApp(null)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingApp ? 'Edit Application' : 'New Application'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingApp(null)
                    resetForm()
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingApp ? handleEdit : handleCreate} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-5">
                  {/* Company */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Company *</label>
                      <button
                        type="button"
                        onClick={() => openCompanyModal()}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        + Add Company
                      </button>
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        placeholder="Search companies..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>
                    <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No companies found</div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <div
                            key={company.id}
                            className={cn(
                              "flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors",
                              formData.companyId === company.id && "bg-slate-50"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, companyId: company.id })}
                              className="flex-1 text-left text-sm font-medium text-slate-900"
                            >
                              {formData.companyId === company.id && <Check className="w-3.5 h-3.5 inline mr-2 text-slate-900" />}
                              {company.name}
                            </button>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => openCompanyModal(company)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCompany(company.id)}
                                disabled={deletingCompanyId === company.id}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Position *</label>
                    <input
                      type="text"
                      value={formData.positionTitle}
                      onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="Senior Software Engineer"
                      required
                    />
                  </div>

                  {/* Job URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Job URL</label>
                    <input
                      type="url"
                      value={formData.jobPostingUrl}
                      onChange={(e) => setFormData({ ...formData, jobPostingUrl: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Add notes..."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusConfig[status].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Referral */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={formData.isReferred}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isReferred: e.target.checked,
                            referredById: e.target.checked ? formData.referredById : '',
                          })
                        }
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                      />
                      <span className="text-sm font-medium text-slate-700">This application was referred</span>
                    </label>

                    {formData.isReferred && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Referred By</label>
                        <select
                          value={formData.referredById}
                          onChange={(e) => setFormData({ ...formData, referredById: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                          <option value="">Select contact</option>
                          {contacts
                            .filter((c) => !formData.companyId || c.company.id === formData.companyId)
                            .map((contact) => (
                              <option key={contact.id} value={contact.id}>
                                {contact.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Files */}
                  {!editingApp && (
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Resume *</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="resume-upload"
                            required
                          />
                          <label
                            htmlFor="resume-upload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                          >
                            <Upload className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {resumeFile ? resumeFile.name : 'Upload resume'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Cover Letter</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="cover-upload"
                          />
                          <label
                            htmlFor="cover-upload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                          >
                            <Upload className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {coverLetterFile ? coverLetterFile.name : 'Upload cover letter (optional)'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingApp(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting || !formData.companyId}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : editingApp ? 'Save Changes' : 'Create Application'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Modal */}
      <AnimatePresence>
        {showCompanyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCompanyModal(false)
              setEditingCompany(null)
              setCompanyFormData({ name: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingCompany ? 'Edit Company' : 'Add Company'}
                </h2>
              </div>

              <form onSubmit={editingCompany ? handleEditCompany : handleCreateCompany} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Google, Microsoft, etc."
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyModal(false)
                      setEditingCompany(null)
                      setCompanyFormData({ name: '' })
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {editingCompany ? 'Save' : 'Add'}
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
