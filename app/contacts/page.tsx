'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Users, UserCheck, Mail, Share2, Sparkles, Building2, ExternalLink, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  linkedinUrl?: string
  email?: string
  position?: string
  status: string
  canRefer: boolean
  isReferring: boolean
  hasReferred: boolean
  linkedinRequestSentAt?: string
  linkedinConnectedAt?: string
  referralRequestedAt?: string
  referralCompletedAt?: string
  company: {
    id: string
    name: string
  }
  _count: {
    referredApplications: number
  }
}

interface Company {
  id: string
  name: string
}

const CONTACT_STATUSES = [
  'REQUEST_SENT',
  'CONNECTED',
  'MESSAGED',
  'REPLIED',
  'MEETING_SCHEDULED',
  'REFERRED',
  'NO_RESPONSE',
]

const statusConfig: Record<string, { label: string; gradient: string }> = {
  REQUEST_SENT: { label: 'Request Sent', gradient: 'from-slate-600 to-slate-800' },
  CONNECTED: { label: 'Connected', gradient: 'from-blue-500 to-blue-700' },
  MESSAGED: { label: 'Messaged', gradient: 'from-amber-500 to-orange-600' },
  REPLIED: { label: 'Replied', gradient: 'from-green-500 to-green-700' },
  MEETING_SCHEDULED: { label: 'Meeting', gradient: 'from-purple-500 to-purple-700' },
  REFERRED: { label: 'Referred', gradient: 'from-emerald-500 to-emerald-700' },
  NO_RESPONSE: { label: 'No Response', gradient: 'from-red-500 to-red-700' },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Tab state for categorizing contacts
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'connected' | 'referring' | 'referred'>('all')

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [canReferFilter, setCanReferFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    email: '',
    linkedinUrl: '',
    position: '',
    status: 'REQUEST_SENT',
    canRefer: false,
  })

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'
      const method = editingContact ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContacts()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleToggleCanRefer = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canRefer: !currentValue }),
      })

      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error updating can refer:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingContact(null)
    setShowModal(true)
  }

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      companyId: contact.company.id,
      email: contact.email || '',
      linkedinUrl: contact.linkedinUrl || '',
      position: contact.position || '',
      status: contact.status,
      canRefer: contact.canRefer,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingContact(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      companyId: '',
      email: '',
      linkedinUrl: '',
      position: '',
      status: 'REQUEST_SENT',
      canRefer: false,
    })
  }

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Tab filter
      let matchesTab: boolean = true
      if (activeTab === 'pending') {
        matchesTab = contact.status === 'REQUEST_SENT' && !contact.linkedinConnectedAt
      } else if (activeTab === 'connected') {
        matchesTab = (contact.status === 'CONNECTED' || !!contact.linkedinConnectedAt) && !(contact.isReferring ?? false) && !(contact.hasReferred ?? false)
      } else if (activeTab === 'referring') {
        matchesTab = contact.isReferring === true
      } else if (activeTab === 'referred') {
        matchesTab = contact.hasReferred === true
      }

      // Search filter
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

      // Status filter
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter

      // Company filter
      const matchesCompany = companyFilter === 'all' || contact.company.id === companyFilter

      // Can Refer filter
      const matchesCanRefer = canReferFilter === 'all' ||
        (canReferFilter === 'yes' && contact.canRefer) ||
        (canReferFilter === 'no' && !contact.canRefer)

      return matchesTab && matchesSearch && matchesStatus && matchesCompany && matchesCanRefer
    })
  }, [contacts, activeTab, searchTerm, statusFilter, companyFilter, canReferFilter])

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: contacts.length,
    pending: contacts.filter(c => c.status === 'REQUEST_SENT' && !c.linkedinConnectedAt).length,
    connected: contacts.filter(c => (c.status === 'CONNECTED' || c.linkedinConnectedAt) && !c.isReferring && !c.hasReferred).length,
    referring: contacts.filter(c => c.isReferring).length,
    referred: contacts.filter(c => c.hasReferred).length,
  }), [contacts])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Loading contacts...
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  Contacts
                </h1>
                <p className="text-slate-400 text-sm mt-1">{filteredContacts.length} of {contacts.length} contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </motion.button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Contacts', count: tabCounts.all, gradient: 'from-slate-600 to-slate-700' },
              { key: 'pending', label: 'Pending Request', count: tabCounts.pending, gradient: 'from-amber-600 to-orange-700' },
              { key: 'connected', label: 'Connected', count: tabCounts.connected, gradient: 'from-blue-600 to-blue-700' },
              { key: 'referring', label: 'Referring Me', count: tabCounts.referring, gradient: 'from-purple-600 to-purple-700' },
              { key: 'referred', label: 'Successfully Referred', count: tabCounts.referred, gradient: 'from-emerald-600 to-teal-700' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                )}
              >
                <span>{tab.label}</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
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
                {CONTACT_STATUSES.map(status => (
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

            {/* Can Refer Filter */}
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={canReferFilter}
                onChange={(e) => setCanReferFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Referral Status</option>
                <option value="yes" className="bg-slate-900">Can Refer</option>
                <option value="no" className="bg-slate-900">Cannot Refer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {searchTerm || statusFilter !== 'all' || companyFilter !== 'all' || canReferFilter !== 'all'
                ? 'No contacts match your filters'
                : 'No contacts yet'}
            </p>
            <p className="text-slate-500 text-sm">
              {searchTerm || statusFilter !== 'all' || companyFilter !== 'all' || canReferFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start building your professional network!'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-6">
                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{contact.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              {contact.company.name}
                            </span>
                            {contact.position && (
                              <span>• {contact.position}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        {/* Status Dropdown */}
                        <select
                          value={contact.status}
                          onChange={(e) => handleQuickStatusUpdate(contact.id, e.target.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all bg-gradient-to-r text-white",
                            `${statusConfig[contact.status]?.gradient} border-transparent hover:scale-105`
                          )}
                        >
                          {CONTACT_STATUSES.map((status) => (
                            <option key={status} value={status} className="bg-slate-900 text-white">
                              {statusConfig[status]?.label || status}
                            </option>
                          ))}
                        </select>

                        {/* Can Refer Toggle */}
                        <button
                          onClick={() => handleToggleCanRefer(contact.id, contact.canRefer)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                            contact.canRefer
                              ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-white/5 text-slate-400 border-2 border-white/10 hover:bg-white/10"
                          )}
                        >
                          {contact.canRefer ? '✓ Can Refer' : 'Cannot Refer'}
                        </button>

                        {contact._count.referredApplications > 0 && (
                          <span className="text-sm text-purple-400 bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/30">
                            {contact._count.referredApplications} referral{contact._count.referredApplications > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Contact Links */}
                      <div className="flex items-center gap-4">
                        {contact.linkedinUrl && (
                          <a
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(contact)}
                        className="p-2.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleteId === contact.id}
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
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Company *</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="" className="bg-slate-900">Select company...</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id} className="bg-slate-900">
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CONTACT_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-slate-900">
                          {statusConfig[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="canRefer"
                      checked={formData.canRefer}
                      onChange={(e) => setFormData({ ...formData, canRefer: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 cursor-pointer accent-emerald-500"
                    />
                    <label htmlFor="canRefer" className="text-sm font-semibold text-slate-300 cursor-pointer">
                      Can refer me to opportunities at their company
                    </label>
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
                    {editingContact ? 'Save Changes' : 'Add Contact'}
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
