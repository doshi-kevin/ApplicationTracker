'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Check, Users, UserCheck, Mail, Linkedin, Sparkles, Building2, ExternalLink } from 'lucide-react'
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

  const connectedCount = contacts.filter(c => c.status === 'CONNECTED' || c.status === 'MESSAGED' || c.status === 'REPLIED').length
  const canReferCount = contacts.filter(c => c.canRefer && c.willingToRefer).length
  const totalReferrals = contacts.reduce((acc, c) => acc + c._count.referredApplications, 0)

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
                  Contacts
                </h1>
                <p className="text-slate-400 mt-1">{contacts.length} networking contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Contact
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: contacts.length, gradient: 'from-slate-600 to-slate-800', icon: Users },
            { label: 'Connected', count: connectedCount, gradient: 'from-blue-500 to-blue-700', icon: UserCheck },
            { label: 'Can Refer', count: canReferCount, gradient: 'from-green-500 to-green-700', icon: Check },
            { label: 'Referrals', count: totalReferrals, gradient: 'from-purple-500 to-purple-700', icon: Mail },
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

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No contacts yet</h3>
            <p className="text-slate-400 mb-6">Start building your professional network</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Contact
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
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
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-1">{contact.name}</h3>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Building2 className="w-4 h-4" />
                            <span>{contact.company.name}</span>
                            {contact.position && (
                              <>
                                <span>•</span>
                                <span className="text-sm">{contact.position}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          value={contact.status}
                          onChange={(e) => handleQuickStatusUpdate(contact.id, e.target.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all bg-gradient-to-r text-white",
                            `${statusConfig[contact.status]?.gradient} border-transparent hover:scale-105`
                          )}
                        >
                          {CONTACT_STATUSES.map((status) => (
                            <option key={status} value={status} className="bg-slate-900">
                              {statusConfig[status]?.label || status}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleToggleCanRefer(contact.id, contact.canRefer)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                            contact.canRefer
                              ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                          )}
                        >
                          {contact.canRefer ? '✓ Can Refer' : 'Cannot Refer'}
                        </button>

                        <button
                          onClick={() => handleToggleWillingToRefer(contact.id, contact.willingToRefer)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                            contact.willingToRefer
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                          )}
                        >
                          {contact.willingToRefer ? '✓ Willing' : 'Maybe'}
                        </button>

                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        )}

                        {contact.linkedinUrl && (
                          <a
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(contact)}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(contact.id)}
                        disabled={deleteId === contact.id}
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
                  {editingContact ? 'Edit Contact' : 'New Contact'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Company *</label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" className="bg-slate-900">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id} className="bg-slate-900">
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CONTACT_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-slate-900">
                          {statusConfig[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-6 pt-4 border-t border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.canRefer}
                        onChange={(e) => setFormData({ ...formData, canRefer: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/5 border-white/10"
                      />
                      <span className="text-white font-medium">Can Refer</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.willingToRefer}
                        onChange={(e) => setFormData({ ...formData, willingToRefer: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/5 border-white/10"
                      />
                      <span className="text-white font-medium">Willing to Refer</span>
                    </label>
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
                    {editingContact ? 'Save Changes' : 'Create Contact'}
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
