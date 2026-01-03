'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Mail, Copy, FileText, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
}

const TEMPLATE_CATEGORIES = [
  'CONNECTION_REQUEST',
  'FOLLOW_UP',
  'THANK_YOU',
  'REFERRAL_REQUEST',
  'COLD_OUTREACH',
  'OTHER',
]

const categoryConfig: Record<string, { label: string; gradient: string; textColor: string }> = {
  CONNECTION_REQUEST: { label: 'Connection', gradient: 'from-blue-500 to-blue-700', textColor: 'text-blue-300' },
  FOLLOW_UP: { label: 'Follow Up', gradient: 'from-amber-500 to-orange-600', textColor: 'text-amber-300' },
  THANK_YOU: { label: 'Thank You', gradient: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-300' },
  REFERRAL_REQUEST: { label: 'Referral', gradient: 'from-purple-500 to-purple-700', textColor: 'text-purple-300' },
  COLD_OUTREACH: { label: 'Cold Outreach', gradient: 'from-orange-500 to-red-600', textColor: 'text-orange-300' },
  OTHER: { label: 'Other', gradient: 'from-slate-500 to-slate-700', textColor: 'text-slate-300' },
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'CONNECTION_REQUEST',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates')
      const data = await response.json()
      setTemplates(data)
      if (data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTemplate ? `/api/email-templates/${editingTemplate.id}` : '/api/email-templates'
      const method = editingTemplate ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchTemplates()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTemplates()
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null)
        }
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingTemplate(null)
    setShowModal(true)
  }

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'CONNECTION_REQUEST',
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
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
          Loading templates...
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  Email Templates
                </h1>
                <p className="text-slate-400 text-sm mt-1">{templates.length} templates</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Template
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <p className="text-slate-400 text-lg">No email templates yet. Create templates to save time!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Templates ({templates.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group bg-white/5 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all",
                        selectedTemplate?.id === template.id
                          ? "border-blue-500/50 shadow-lg shadow-blue-500/20 bg-white/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/10"
                      )}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white mb-2">{template.name}</h3>
                          <span className={cn(
                            "inline-block text-xs px-3 py-1 rounded-lg font-semibold bg-gradient-to-r text-white border-2 border-transparent",
                            categoryConfig[template.category]?.gradient
                          )}>
                            {categoryConfig[template.category]?.label || template.category}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditModal(template)
                            }}
                            className="p-1.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(template.id)
                            }}
                            disabled={deleteId === template.id}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Template Preview */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <motion.div
                  key={selectedTemplate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-3">{selectedTemplate.name}</h2>
                        <span className={cn(
                          "inline-block text-sm px-4 py-2 rounded-xl font-semibold bg-gradient-to-r text-white border-2 border-transparent shadow-lg",
                          categoryConfig[selectedTemplate.category]?.gradient
                        )}>
                          {categoryConfig[selectedTemplate.category]?.label || selectedTemplate.category}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(`Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.body}`, 'full')}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                      >
                        {copiedText === 'full' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy Template
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-400" />
                          Subject Line
                        </label>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(selectedTemplate.subject, 'subject')}
                          className="text-sm text-slate-300 hover:text-white flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                        >
                          {copiedText === 'subject' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </motion.button>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                        <p className="text-base text-white font-medium">{selectedTemplate.subject}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          Email Body
                        </label>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(selectedTemplate.body, 'body')}
                          className="text-sm text-slate-300 hover:text-white flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                        >
                          {copiedText === 'body' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </motion.button>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                        <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                          {selectedTemplate.body}
                        </pre>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-sm text-blue-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold">Tip:</span> Replace placeholders like {'{name}'}, {'{company}'}, and {'{position}'} with actual values when using this template.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center h-full flex items-center justify-center"
                >
                  <p className="text-slate-400 text-lg">Select a template to view and copy</p>
                </motion.div>
              )}
            </div>
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
              className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                        placeholder="e.g., LinkedIn Connection Request"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900 text-white">
                            {categoryConfig[cat]?.label || cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Subject Line *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                      placeholder="e.g., Connecting from {company} - {position} opportunity"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email Body *</label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono placeholder-slate-500"
                      rows={12}
                      placeholder="Hi {name},&#10;&#10;I hope this message finds you well...&#10;&#10;Use placeholders like {name}, {company}, {position}, etc."
                      required
                    />
                    <p className="text-xs text-slate-400 mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                      Use placeholders: {'{name}'}, {'{company}'}, {'{position}'}, {'{role}'}, etc.
                    </p>
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
                    {editingTemplate ? 'Save Changes' : 'Create Template'}
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
