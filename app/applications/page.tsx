'use client'

import { useState, useEffect, useMemo } from 'react'
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
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Filter
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

const statusConfig: Record<string, { label: string; gradient: string; icon: any; textColor: string }> = {
  NOT_APPLIED: { label: 'Not Applied', gradient: 'from-slate-600 to-slate-800', icon: Clock, textColor: 'text-slate-300' },
  APPLIED: { label: 'Applied', gradient: 'from-blue-500 to-blue-700', icon: FileText, textColor: 'text-blue-300' },
  IN_REVIEW: { label: 'In Review', gradient: 'from-amber-500 to-orange-600', icon: Target, textColor: 'text-amber-300' },
  INTERVIEW_SCHEDULED: { label: 'Interview', gradient: 'from-purple-500 to-purple-700', icon: Calendar, textColor: 'text-purple-300' },
  OFFER_RECEIVED: { label: 'Offer', gradient: 'from-emerald-500 to-emerald-700', icon: TrendingUp, textColor: 'text-emerald-300' },
  ACCEPTED: { label: 'Accepted', gradient: 'from-green-500 to-green-700', icon: Check, textColor: 'text-green-300' },
  REJECTED: { label: 'Rejected', gradient: 'from-red-500 to-red-700', icon: X, textColor: 'text-red-300' },
  WITHDRAWN: { label: 'Withdrawn', gradient: 'from-gray-500 to-gray-700', icon: X, textColor: 'text-gray-300' },
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

  // Quick Add Modal
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [showCompanyDetailsStep, setShowCompanyDetailsStep] = useState(false)
  const [quickAddData, setQuickAddData] = useState({
    companyName: '',
    positionTitle: '',
    jobPostingUrl: '',
    resumePath: '',
    coverLetterPath: '',
  })
  const [newCompanyDetails, setNewCompanyDetails] = useState({
    website: '',
    careersUrl: '',
    notes: '',
  })

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [isReferredFilter, setIsReferredFilter] = useState<string>('all')

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

  const handleQuickAddStep1 = () => {
    if (!quickAddData.companyName.trim() || !quickAddData.positionTitle.trim() || !quickAddData.resumePath.trim()) {
      alert('Please fill in Company Name, Position Title, and Resume Path')
      return
    }

    // Check if company exists
    const existingCompany = companies.find(c => c.name.toLowerCase() === quickAddData.companyName.trim().toLowerCase())

    if (!existingCompany) {
      // Show company details step
      setShowCompanyDetailsStep(true)
    } else {
      // Company exists, create application directly
      handleQuickAdd(existingCompany.id)
    }
  }

  const handleQuickAdd = async (companyId?: string) => {
    setSubmitting(true)
    try {
      let finalCompanyId = companyId

      // If no companyId provided, create new company with details
      if (!finalCompanyId) {
        const companyRes = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: quickAddData.companyName.trim(),
            website: newCompanyDetails.website || null,
            careersUrl: newCompanyDetails.careersUrl || null,
            notes: newCompanyDetails.notes || null,
          }),
        })
        const newCompany = await companyRes.json()
        finalCompanyId = newCompany.id
      }

      // Create application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: finalCompanyId,
          positionTitle: quickAddData.positionTitle,
          jobPostingUrl: quickAddData.jobPostingUrl || null,
          status: 'NOT_APPLIED',
          resumePath: quickAddData.resumePath,
          coverLetterPath: quickAddData.coverLetterPath || null,
        }),
      })

      if (appRes.ok) {
        await fetchData()
        setShowQuickAddModal(false)
        setShowCompanyDetailsStep(false)
        setQuickAddData({
          companyName: '',
          positionTitle: '',
          jobPostingUrl: '',
          resumePath: '',
          coverLetterPath: '',
        })
        setNewCompanyDetails({
          website: '',
          careersUrl: '',
          notes: '',
        })
      }
    } catch (error) {
      console.error('Error quick adding application:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  )

  // Filtered applications - MUST be before early return to follow Rules of Hooks
  const filteredApplications = useMemo<Application[]>(() => {
    if (!Array.isArray(applications) || applications.length === 0) {
      return []
    }

    return applications.filter(app => {
      // Search filter
      const matchesSearch = app.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      // Company filter
      const matchesCompany = companyFilter === 'all' || app.company.id === companyFilter

      // Referral filter
      const matchesReferral = isReferredFilter === 'all' ||
        (isReferredFilter === 'yes' && app.isReferred) ||
        (isReferredFilter === 'no' && !app.isReferred)

      return matchesSearch && matchesStatus && matchesCompany && matchesReferral
    })
  }, [applications, searchTerm, statusFilter, companyFilter, isReferredFilter])

  const statusCounts = useMemo<Record<string, number>>(() => {
    const initialCounts = APPLICATION_STATUSES.reduce((acc, status) => {
      acc[status] = 0
      return acc
    }, {} as Record<string, number>)

    if (!Array.isArray(filteredApplications) || filteredApplications.length === 0) {
      return initialCounts
    }

    return APPLICATION_STATUSES.reduce((acc, status) => {
      acc[status] = filteredApplications.filter(a => a.status === status).length
      return acc
    }, {} as Record<string, number>)
  }, [filteredApplications])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Loading applications...
        </motion.div>
      </div>
    )
  }

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
                  Applications
                </h1>
                <p className="text-slate-400 mt-1">{filteredApplications.length} of {applications.length} applications</p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Quick Add
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Full Form
              </motion.button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by position or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                {APPLICATION_STATUSES.map(status => (
                  <option key={status} value={status} className="bg-slate-900">
                    {statusConfig[status]?.label || status}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id} className="bg-slate-900">
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Referral Filter */}
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={isReferredFilter}
                onChange={(e) => setIsReferredFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Applications</option>
                <option value="yes" className="bg-slate-900">Referred</option>
                <option value="no" className="bg-slate-900">Not Referred</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Applied', count: statusCounts.APPLIED, gradient: 'from-blue-500 to-blue-700', icon: FileText },
            { label: 'In Review', count: statusCounts.IN_REVIEW, gradient: 'from-amber-500 to-orange-600', icon: Target },
            { label: 'Interview', count: statusCounts.INTERVIEW_SCHEDULED, gradient: 'from-purple-500 to-purple-700', icon: Calendar },
            { label: 'Offers', count: statusCounts.OFFER_RECEIVED, gradient: 'from-emerald-500 to-emerald-700', icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
            >
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", stat.gradient)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {applications.length === 0 ? 'No applications yet' : 'No applications match your filters'}
            </h3>
            <p className="text-slate-400 mb-6">
              {applications.length === 0 ? 'Start tracking your job applications' : 'Try adjusting your search or filters'}
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Application
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((app, index) => {
                const StatusIcon = statusConfig[app.status]?.icon || Clock
                return (
                  <motion.div
                    key={app.id}
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
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white mb-1">{app.positionTitle}</h3>
                            <p className="text-slate-400">{app.company.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap mb-3">
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(app.appliedDate).toLocaleDateString()}
                          </div>
                          {app.isReferred && app.referredByContact && (
                            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm font-medium">
                              Referred by {app.referredByContact.name}
                            </div>
                          )}
                          {app.jobPostingUrl && (
                            <a
                              href={app.jobPostingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View Job <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {app.description && (
                          <p className="text-slate-400 text-sm line-clamp-2">{app.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusUpdate(app.id, e.target.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all bg-gradient-to-r text-white",
                            `${statusConfig[app.status]?.gradient} border-transparent hover:scale-105`
                          )}
                        >
                          {APPLICATION_STATUSES.map((status) => (
                            <option key={status} value={status} className="bg-slate-900 text-white">
                              {statusConfig[status]?.label || status}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(app)}
                            className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(app.id)}
                            disabled={deleteId === app.id}
                            className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center text-red-400 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false)
              setEditingApp(null)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white">
                  {editingApp ? 'Edit Application' : 'New Application'}
                </h2>
              </div>

              <form onSubmit={editingApp ? handleEdit : handleCreate} className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-6">
                  {/* Company */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-300">Company *</label>
                      <button
                        type="button"
                        onClick={() => openCompanyModal()}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        + Add Company
                      </button>
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        placeholder="Search companies..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl max-h-48 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No companies found</div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <div
                            key={company.id}
                            className={cn(
                              "flex items-center justify-between p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors",
                              formData.companyId === company.id && "bg-blue-500/20"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, companyId: company.id })}
                              className="flex-1 text-left text-white flex items-center gap-2"
                            >
                              {formData.companyId === company.id && <Check className="w-4 h-4 text-blue-400" />}
                              {company.name}
                            </button>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openCompanyModal(company)}
                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCompany(company.id)}
                                disabled={deletingCompanyId === company.id}
                                className="p-2 hover:bg-white/10 rounded-lg text-red-400 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Position Title *</label>
                    <input
                      type="text"
                      value={formData.positionTitle}
                      onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Senior Software Engineer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Job Posting URL</label>
                    <input
                      type="url"
                      value={formData.jobPostingUrl}
                      onChange={(e) => setFormData({ ...formData, jobPostingUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Notes</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add notes..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-slate-900">
                          {statusConfig[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Referral */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
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
                        className="w-5 h-5 rounded bg-white/5 border-white/10"
                      />
                      <span className="text-white font-medium">This application was referred</span>
                    </label>

                    {formData.isReferred && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">Referred By</label>
                        <select
                          value={formData.referredById}
                          onChange={(e) => setFormData({ ...formData, referredById: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="" className="bg-slate-900">Select contact</option>
                          {contacts
                            .filter((c) => !formData.companyId || c.company.id === formData.companyId)
                            .map((contact) => (
                              <option key={contact.id} value={contact.id} className="bg-slate-900">
                                {contact.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Files */}
                  {!editingApp && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">Resume *</label>
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
                            className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 bg-white/5 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-300 font-medium">
                              {resumeFile ? resumeFile.name : 'Upload resume (PDF, DOC, DOCX)'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">Cover Letter (Optional)</label>
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
                            className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 bg-white/5 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-300 font-medium">
                              {coverLetterFile ? coverLetterFile.name : 'Upload cover letter (PDF, DOC, DOCX)'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingApp(null)
                      resetForm()
                    }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.companyId}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : editingApp ? 'Save Changes' : 'Create Application'}
                  </button>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCompanyModal(false)
              setEditingCompany(null)
              setCompanyFormData({ name: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  {editingCompany ? 'Edit Company' : 'New Company'}
                </h2>
              </div>

              <form onSubmit={editingCompany ? handleEditCompany : handleCreateCompany} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Company Name *</label>
                  <input
                    type="text"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Google, Microsoft, etc."
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyModal(false)
                      setEditingCompany(null)
                      setCompanyFormData({ name: '' })
                    }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    {editingCompany ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Quick Add Application
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Just the essentials - we'll auto-create the company if needed</p>
                </div>
                <button
                  onClick={() => setShowQuickAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {!showCompanyDetailsStep ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={quickAddData.companyName}
                      onChange={(e) => setQuickAddData({ ...quickAddData, companyName: e.target.value })}
                      placeholder="e.g., Google, Meta, Amazon"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      value={quickAddData.positionTitle}
                      onChange={(e) => setQuickAddData({ ...quickAddData, positionTitle: e.target.value })}
                      placeholder="e.g., Senior Software Engineer, Product Manager"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      LinkedIn Job URL
                    </label>
                    <input
                      type="url"
                      value={quickAddData.jobPostingUrl}
                      onChange={(e) => setQuickAddData({ ...quickAddData, jobPostingUrl: e.target.value })}
                      placeholder="https://www.linkedin.com/jobs/..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Resume Path *
                    </label>
                    <input
                      type="text"
                      value={quickAddData.resumePath}
                      onChange={(e) => setQuickAddData({ ...quickAddData, resumePath: e.target.value })}
                      placeholder="e.g., C:/resumes/google-swe-resume.pdf"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Full path to your resume file</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cover Letter Path (Optional)
                    </label>
                    <input
                      type="text"
                      value={quickAddData.coverLetterPath}
                      onChange={(e) => setQuickAddData({ ...quickAddData, coverLetterPath: e.target.value })}
                      placeholder="e.g., C:/cover-letters/google-swe-cover.pdf"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowQuickAddModal(false)
                        setShowCompanyDetailsStep(false)
                      }}
                      className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleQuickAddStep1}
                      disabled={submitting || !quickAddData.companyName || !quickAddData.positionTitle || !quickAddData.resumePath}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? 'Adding...' : 'Next'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      Company "<span className="font-semibold">{quickAddData.companyName}</span>" doesn't exist yet. Please provide company details:
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={newCompanyDetails.website}
                      onChange={(e) => setNewCompanyDetails({ ...newCompanyDetails, website: e.target.value })}
                      placeholder="e.g., https://www.google.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Careers Page URL
                    </label>
                    <input
                      type="url"
                      value={newCompanyDetails.careersUrl}
                      onChange={(e) => setNewCompanyDetails({ ...newCompanyDetails, careersUrl: e.target.value })}
                      placeholder="e.g., https://careers.google.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newCompanyDetails.notes}
                      onChange={(e) => setNewCompanyDetails({ ...newCompanyDetails, notes: e.target.value })}
                      placeholder="Any additional notes about the company..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCompanyDetailsStep(false)}
                      className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleQuickAdd()}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? 'Creating...' : 'Create Application'}
                    </button>
                  </div>
                </div>
              )}
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
