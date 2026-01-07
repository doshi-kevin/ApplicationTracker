'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  FileText,
  Code,
  ChevronDown,
  Save,
  X,
  Copy,
  FolderOpen,
  File,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResumeSection {
  id: string
  templateId: string
  name: string
  order: number
  latexCode: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ResumeTemplate {
  id: string
  name: string
  description?: string
  sections: ResumeSection[]
  _count: {
    sections: number
  }
  createdAt: string
  updatedAt: string
}

export default function ResumesPage() {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResumeTemplate | null>(null)
  const [editingSection, setEditingSection] = useState<ResumeSection | null>(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('')

  // Form data
  const [templateData, setTemplateData] = useState({ name: '', description: '' })
  const [sectionData, setSectionData] = useState({
    name: '',
    order: 0,
    latexCode: '',
    notes: '',
  })

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/resume-templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTemplate = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const openCreateTemplateModal = () => {
    setEditingTemplate(null)
    setTemplateData({ name: '', description: '' })
    setShowTemplateModal(true)
  }

  const openEditTemplateModal = (template: ResumeTemplate) => {
    setEditingTemplate(template)
    setTemplateData({ name: template.name, description: template.description || '' })
    setShowTemplateModal(true)
  }

  const openCreateSectionModal = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setEditingSection(null)
    setCurrentTemplateId(templateId)
    setSectionData({
      name: '',
      order: template?.sections.length || 0,
      latexCode: '',
      notes: '',
    })
    setShowSectionModal(true)
  }

  const openEditSectionModal = (section: ResumeSection) => {
    setEditingSection(section)
    setCurrentTemplateId(section.templateId)
    setSectionData({
      name: section.name,
      order: section.order,
      latexCode: section.latexCode,
      notes: section.notes || '',
    })
    setShowSectionModal(true)
  }

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingTemplate
        ? `/api/resume-templates/${editingTemplate.id}`
        : '/api/resume-templates'

      const response = await fetch(url, {
        method: editingTemplate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        await fetchTemplates()
        setShowTemplateModal(false)
        setTemplateData({ name: '', description: '' })
      }
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingSection
        ? `/api/resume-sections/${editingSection.id}`
        : '/api/resume-sections'

      const body = editingSection
        ? sectionData
        : { ...sectionData, templateId: currentTemplateId }

      const response = await fetch(url, {
        method: editingSection ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await fetchTemplates()
        setShowSectionModal(false)
        setSectionData({ name: '', order: 0, latexCode: '', notes: '' })
      }
    } catch (error) {
      console.error('Error saving section:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/resume-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const handleDeleteSection = async (id: string) => {
    try {
      setDeleteSectionId(id)
      const response = await fetch(`/api/resume-sections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting section:', error)
    } finally {
      setDeleteSectionId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
          Loading resumes...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent flex items-center gap-3">
                <FileText className="w-10 h-10 text-purple-400" />
                Resume Templates
              </h1>
              <p className="text-slate-400 mt-1">{templates.length} templates</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateTemplateModal}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Template
          </motion.button>
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">No resume templates yet</p>
              <p className="text-slate-500 text-sm mt-2">Create your first template to get started</p>
            </motion.div>
          ) : (
            templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all"
              >
                {/* Template Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleTemplate(template.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: expandedTemplates.has(template.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-purple-400" />
                        </motion.div>
                      </button>
                      <FolderOpen className="w-6 h-6 text-purple-400" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{template.name}</h3>
                        {template.description && (
                          <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-2">
                          {template._count.sections} section{template._count.sections !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openCreateSectionModal(template.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                      <button
                        onClick={() => openEditTemplateModal(template)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deleteId === template.id}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <AnimatePresence>
                  {expandedTemplates.has(template.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-3">
                        {template.sections.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-4">
                            No sections yet. Add your first section to get started.
                          </p>
                        ) : (
                          template.sections.map((section) => (
                            <motion.div
                              key={section.id}
                              className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <File className="w-5 h-5 text-emerald-400" />
                                  <div>
                                    <h4 className="font-semibold text-white">{section.name}</h4>
                                    <p className="text-xs text-slate-500">Order: {section.order}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => copyToClipboard(section.latexCode)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-emerald-400"
                                    title="Copy LaTeX code"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditSectionModal(section)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={deleteSectionId === section.id}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-slate-950/50 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                                <pre className="whitespace-pre-wrap">{section.latexCode || '// LaTeX code here'}</pre>
                              </div>
                              {section.notes && (
                                <p className="text-slate-400 text-sm mt-2 italic">{section.notes}</p>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    placeholder="e.g., Machine Learning Intern, SDE Intern"
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateData.description}
                    onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Saving...' : (editingTemplate ? 'Save Changes' : 'Create Template')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Modal */}
      <AnimatePresence>
        {showSectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingSection ? 'Edit Section' : 'Create Section'}
                </h2>
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitSection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={sectionData.name}
                      onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })}
                      placeholder="e.g., Skills, Experience, Education"
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Order *
                    </label>
                    <input
                      type="number"
                      value={sectionData.order}
                      onChange={(e) => setSectionData({ ...sectionData, order: parseInt(e.target.value) })}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    LaTeX Code
                  </label>
                  <textarea
                    value={sectionData.latexCode}
                    onChange={(e) => setSectionData({ ...sectionData, latexCode: e.target.value })}
                    placeholder="Paste your LaTeX code here..."
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={sectionData.notes}
                    onChange={(e) => setSectionData({ ...sectionData, notes: e.target.value })}
                    placeholder="Optional notes about this section..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSectionModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Saving...' : (editingSection ? 'Save Changes' : 'Create Section')}
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
