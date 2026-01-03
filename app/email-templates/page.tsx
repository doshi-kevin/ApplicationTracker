'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Edit2, Trash2, Mail, Copy, FileText, CheckCircle2 } from 'lucide-react'
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

const categoryConfig: Record<string, { label: string; color: string }> = {
  CONNECTION_REQUEST: { label: 'Connection', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  THANK_YOU: { label: 'Thank You', color: 'bg-green-50 text-green-700 border-green-200' },
  REFERRAL_REQUEST: { label: 'Referral', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  COLD_OUTREACH: { label: 'Cold Outreach', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  OTHER: { label: 'Other', color: 'bg-slate-50 text-slate-700 border-slate-200' },
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Email Templates</h1>
                <p className="text-sm text-slate-500 mt-0.5">{templates.length} templates</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <p className="text-slate-500 text-sm">No email templates yet. Create templates to save time!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Templates ({templates.length})</h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group bg-white border rounded-lg p-3 cursor-pointer transition-all",
                        selectedTemplate?.id === template.id
                          ? "border-slate-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      )}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 mb-1">{template.name}</h3>
                          <span className={cn(
                            "inline-block text-xs px-2 py-0.5 rounded-md border font-medium",
                            categoryConfig[template.category]?.color
                          )}>
                            {categoryConfig[template.category]?.label || template.category}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditModal(template)
                            }}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(template.id)
                            }}
                            disabled={deleteId === template.id}
                            className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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

            {/* Template Preview */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <motion.div
                  key={selectedTemplate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-2">{selectedTemplate.name}</h2>
                        <span className={cn(
                          "inline-block text-xs px-2 py-1 rounded-md border font-medium",
                          categoryConfig[selectedTemplate.category]?.color
                        )}>
                          {categoryConfig[selectedTemplate.category]?.label || selectedTemplate.category}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.body}`, 'full')}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        {copiedText === 'full' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Template
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          Subject Line
                        </label>
                        <button
                          onClick={() => copyToClipboard(selectedTemplate.subject, 'subject')}
                          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          {copiedText === 'subject' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-900">{selectedTemplate.subject}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          Email Body
                        </label>
                        <button
                          onClick={() => copyToClipboard(selectedTemplate.body, 'body')}
                          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          {copiedText === 'body' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <pre className="text-sm text-slate-900 whitespace-pre-wrap font-sans">
                          {selectedTemplate.body}
                        </pre>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold">Tip:</span> Replace placeholders like {'{name}'}, {'{company}'}, and {'{position}'} with actual values when using this template.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center h-full flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Select a template to view and copy</p>
                </div>
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Template Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="e.g., LinkedIn Connection Request"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      >
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {categoryConfig[cat]?.label || cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Subject Line *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="e.g., Connecting from {company} - {position} opportunity"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Body *</label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                      rows={12}
                      placeholder="Hi {name},&#10;&#10;I hope this message finds you well...&#10;&#10;Use placeholders like {name}, {company}, {position}, etc."
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Use placeholders: {'{name}'}, {'{company}'}, {'{position}'}, {'{role}'}, etc.
                    </p>
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
                    {editingTemplate ? 'Save Changes' : 'Create Template'}
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
