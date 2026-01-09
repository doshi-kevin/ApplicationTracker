'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Youtube,
  Github,
  BookOpen,
  FileText,
  Link as LinkIcon,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Star,
  Check,
  ExternalLink,
  Folder,
  FolderOpen,
  Search,
  Filter
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Resource {
  id: string
  title: string
  description?: string
  url?: string
  type: string
  category?: string
  tags?: string
  parentId?: string
  parent?: Resource
  subResources?: Resource[]
  isCompleted: boolean
  isFavorite: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

const RESOURCE_TYPES = [
  { value: 'youtube', label: 'YouTube Video', icon: Youtube, color: 'text-red-400' },
  { value: 'github', label: 'GitHub Repo', icon: Github, color: 'text-purple-400' },
  { value: 'article', label: 'Article/Blog', icon: FileText, color: 'text-blue-400' },
  { value: 'documentation', label: 'Documentation', icon: BookOpen, color: 'text-emerald-400' },
  { value: 'course', label: 'Online Course', icon: BookOpen, color: 'text-amber-400' },
  { value: 'other', label: 'Other', icon: LinkIcon, color: 'text-slate-400' },
]

const CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'Full Stack',
  'Data Structures & Algorithms',
  'System Design',
  'Machine Learning',
  'DevOps',
  'Mobile Development',
  'Interview Preparation',
  'Career Development',
  'Other'
]

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [parentResource, setParentResource] = useState<Resource | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'youtube',
    category: '',
    tags: '',
    notes: '',
    isCompleted: false,
    isFavorite: false
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Error fetching resources:', error)
      showToast('error', 'Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      type: 'youtube',
      category: '',
      tags: '',
      notes: '',
      isCompleted: false,
      isFavorite: false
    })
    setEditingResource(null)
    setParentResource(null)
  }

  const openCreateModal = (parent?: Resource) => {
    resetForm()
    setParentResource(parent || null)
    setShowModal(true)
  }

  const openEditModal = (resource: Resource) => {
    setFormData({
      title: resource.title,
      description: resource.description || '',
      url: resource.url || '',
      type: resource.type,
      category: resource.category || '',
      tags: resource.tags || '',
      notes: resource.notes || '',
      isCompleted: resource.isCompleted,
      isFavorite: resource.isFavorite
    })
    setEditingResource(resource)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources'
      const method = editingResource ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: parentResource?.id || null
        })
      })

      if (response.ok) {
        await fetchResources()
        setShowModal(false)
        resetForm()
        showToast('success', editingResource ? 'Resource updated!' : 'Resource created!')
      } else {
        showToast('error', 'Failed to save resource')
      }
    } catch (error) {
      console.error('Error saving resource:', error)
      showToast('error', 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all sub-resources.')) return

    try {
      setDeleteId(id)
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' })

      if (response.ok) {
        await fetchResources()
        showToast('success', 'Resource deleted!')
      } else {
        showToast('error', 'Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      showToast('error', 'An error occurred')
    } finally {
      setDeleteId(null)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleCompleted = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resource, isCompleted: !resource.isCompleted })
      })

      if (response.ok) {
        await fetchResources()
        showToast('success', resource.isCompleted ? 'Marked as incomplete' : 'Marked as complete!')
      }
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  const toggleFavorite = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resource, isFavorite: !resource.isFavorite })
      })

      if (response.ok) {
        await fetchResources()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const getTypeConfig = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type) || RESOURCE_TYPES[RESOURCE_TYPES.length - 1]
  }

  // Filter root resources (no parent)
  const rootResources = resources.filter(r => !r.parentId)

  // Apply filters
  const filteredResources = rootResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory
    const matchesType = filterType === 'all' || r.type === filterType
    return matchesSearch && matchesCategory && matchesType
  })

  const ResourceItem = ({ resource, depth = 0 }: { resource: Resource; depth?: number }) => {
    const typeConfig = getTypeConfig(resource.type)
    const Icon = typeConfig.icon
    const hasChildren = resource.subResources && resource.subResources.length > 0
    const isExpanded = expandedIds.has(resource.id)

    return (
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all ${
            resource.isCompleted ? 'opacity-60' : ''
          }`}
          style={{ marginLeft: depth * 24 }}
        >
          <div className="flex items-start gap-4">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(resource.id)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            {!hasChildren && <div className="w-6" />}

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${typeConfig.color.replace('text-', '')}/20 to-${typeConfig.color.replace('text-', '')}/10 flex items-center justify-center flex-shrink-0 border border-white/10`}>
              <Icon className={`w-5 h-5 ${typeConfig.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {resource.title}
                    {resource.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {resource.category && (
                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400">
                    {resource.category}
                  </span>
                )}
                {resource.tags?.split(',').filter(Boolean).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-400">
                    {tag.trim()}
                  </span>
                ))}
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Open Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleCompleted(resource)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  resource.isCompleted
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
                title={resource.isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(resource)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 hover:bg-white/10 transition-colors"
                title="Toggle favorite"
              >
                <Star className={`w-4 h-4 ${resource.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={() => openCreateModal(resource)}
                className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Add sub-resource"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEditModal(resource)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(resource.id)}
                disabled={deleteId === resource.id}
                className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Sub-resources */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {resource.subResources!.map(sub => (
                <ResourceItem key={sub.id} resource={sub} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-white">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Learning Resources
          </h1>
          <p className="text-slate-400 mt-2">
            Organize YouTube videos, GitHub repos, articles, and more
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      {/* Filters */}
      {resources.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="bg-slate-900">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="bg-slate-900">All Types</option>
            {RESOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value} className="bg-slate-900">{type.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {resources.length === 0 ? 'No resources yet' : 'No resources match your filters'}
          </h3>
          <p className="text-slate-400 mb-6">
            {resources.length === 0 ? 'Add your first learning resource' : 'Try adjusting your search or filters'}
          </p>
          {resources.length === 0 && (
            <button
              onClick={() => openCreateModal()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResources.map(resource => (
            <ResourceItem key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white">
                  {editingResource ? 'Edit Resource' : parentResource ? `Add Sub-Resource to "${parentResource.title}"` : 'New Resource'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Resource title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {RESOURCE_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-slate-900">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-slate-900">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="react, tutorial, beginner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Personal notes..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCompleted}
                      onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <span className="text-sm text-slate-300">Completed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <span className="text-sm text-slate-300">Favorite</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all"
                  >
                    {editingResource ? 'Update' : 'Create'}
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
