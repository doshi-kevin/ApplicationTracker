'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Check, Users, UserCheck, Mail, Linkedin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  linkedinUrl?: string
  email?: string
  position?: string
  status: string
  canRefer: boolean
  willingToRefer: boolean
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

const statusConfig: Record<string, { label: string; color: string }> = {
  REQUEST_SENT: { label: 'Request Sent', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  CONNECTED: { label: 'Connected', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  MESSAGED: { label: 'Messaged', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  REPLIED: { label: 'Replied', color: 'bg-green-50 text-green-700 border-green-200' },
  MEETING_SCHEDULED: { label: 'Meeting', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  REFERRED: { label: 'Referred', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  NO_RESPONSE: { label: 'No Response', color: 'bg-red-50 text-red-700 border-red-200' },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    email: '',
    linkedinUrl: '',
    position: '',
    status: 'REQUEST_SENT',
    canRefer: false,
    willingToRefer: false,
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

  const handleToggleWillingToRefer = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ willingToRefer: !currentValue }),
      })

      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error updating willing to refer:', error)
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
      willingToRefer: contact.willingToRefer,
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
      willingToRefer: false,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading contacts...</div>
      </div>
    )
  }

  const connectedCount = contacts.filter(c => c.status === 'CONNECTED' || c.status === 'MESSAGED' || c.status === 'REPLIED').length
  const canReferCount = contacts.filter(c => c.canRefer && c.willingToRefer).length
  const totalReferrals = contacts.reduce((acc, c) => acc + c._count.referredApplications, 0)

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
                <h1 className="text-xl font-semibold text-slate-900">Contacts</h1>
                <p className="text-sm text-slate-500 mt-0.5">{contacts.length} total contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Contact
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
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-semibold text-slate-900">{contacts.length}</p>
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
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Connected</p>
                <p className="text-xl font-semibold text-slate-900">{connectedCount}</p>
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
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Can Refer</p>
                <p className="text-xl font-semibold text-slate-900">{canReferCount}</p>
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
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Referrals</p>
                <p className="text-xl font-semibold text-slate-900">{totalReferrals}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <p className="text-slate-500 text-sm">No contacts yet. Add your first LinkedIn connection!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-slate-900">{contact.name}</h3>
                        <span className="text-xs text-slate-500">at {contact.company.name}</span>
                      </div>

                      {contact.position && (
                        <p className="text-xs text-slate-500 mb-2">{contact.position}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={contact.status}
                          onChange={(e) => handleQuickStatusUpdate(contact.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900",
                            statusConfig[contact.status]?.color
                          )}
                        >
                          {CONTACT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status]?.label || status}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleToggleCanRefer(contact.id, contact.canRefer)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md font-medium transition-colors",
                            contact.canRefer
                              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          {contact.canRefer ? '✓ Can Refer' : 'Cannot Refer'}
                        </button>

                        <button
                          onClick={() => handleToggleWillingToRefer(contact.id, contact.willingToRefer)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md font-medium transition-colors",
                            contact.willingToRefer
                              ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          )}
                        >
                          {contact.willingToRefer ? '✓ Willing' : 'Maybe'}
                        </button>

                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                        )}

                        {contact.linkedinUrl && (
                          <a
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(contact)}
                        className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleteId === contact.id}
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
                  {editingContact ? 'Edit Contact' : 'New Contact'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Company *</label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      {CONTACT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusConfig[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.canRefer}
                        onChange={(e) => setFormData({ ...formData, canRefer: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      Can Refer
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.willingToRefer}
                        onChange={(e) => setFormData({ ...formData, willingToRefer: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      Willing to Refer
                    </label>
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
                    {editingContact ? 'Save Changes' : 'Create Contact'}
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
