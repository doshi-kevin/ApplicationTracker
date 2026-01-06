'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  BookOpen,
  Code,
  Rocket,
  GraduationCap,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Filter,
  Youtube,
  Link as LinkIcon,
  TrendingUp,
  Calendar,
  Target,
  Lightbulb,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LearningItem {
  id: string
  type: string
  title: string
  description?: string
  resourceUrl?: string
  additionalLinks?: string
  category?: string
  tags?: string
  status: string
  priority: string
  progress: number
  targetDate?: string
  startedAt?: string
  completedAt?: string
  notes?: string
  keyTakeaways?: string
  createdAt: string
  updatedAt: string
}

const LEARNING_TYPES = [
  { value: 'SKILL', label: 'Skill', icon: TrendingUp, color: 'emerald', description: 'Learn a new skill' },
  { value: 'PROJECT', label: 'Project', icon: Rocket, color: 'purple', description: 'Build a project' },
  { value: 'CONCEPT', label: 'Concept', icon: Lightbulb, color: 'amber', description: 'Understand a concept' },
  { value: 'COURSE', label: 'Course', icon: GraduationCap, color: 'blue', description: 'Complete a course' },
]

const STATUSES = ['TO_LEARN', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'Design', 'Other']

export default function LearningPage() {
  const [items, setItems] = useState<LearningItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    type: 'CONCEPT',
    title: '',
    description: '',
    resourceUrl: '',
    category: '',
    tags: '',
    status: 'TO_LEARN',
    priority: 'MEDIUM',
    progress: '0',
    targetDate: '',
    notes: '',
  })

  const filteredItems = useMemo<LearningItem[]>(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return []
    }

    return items.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (item.tags?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

      return matchesSearch && matchesType && matchesStatus && matchesCategory
    })
  }, [items, searchTerm, typeFilter, statusFilter, categoryFilter])

  const stats = useMemo(() => {
    return {
      total: items.length,
      toLearn: items.filter(i => i.status === 'TO_LEARN').length,
      inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
      completed: items.filter(i => i.status === 'COMPLETED').length,
    }
  }, [items])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/learning')
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching learning items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem ? `/api/learning/${editingItem.id}` : '/api/learning'
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          progress: parseInt(formData.progress),
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving learning item:', error)
    }
  }

  const handleStatusChange = async (item: LearningItem, newStatus: string) => {
    try {
      const response = await fetch(`/api/learning/${item.id}`, {
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
      const response = await fetch(`/api/learning/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting learning item:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingItem(null)
    setShowModal(true)
  }

  const openEditModal = (item: LearningItem) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || '',
      resourceUrl: item.resourceUrl || '',
      category: item.category || '',
      tags: item.tags || '',
      status: item.status,
      priority: item.priority,
      progress: item.progress.toString(),
      targetDate: item.targetDate ? new Date(item.targetDate).toISOString().slice(0, 10) : '',
      notes: item.notes || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'CONCEPT',
      title: '',
      description: '',
      resourceUrl: '',
      category: '',
      tags: '',
      status: 'TO_LEARN',
      priority: 'MEDIUM',
      progress: '0',
      targetDate: '',
      notes: '',
    })
  }

  const getTypeConfig = (type: string) => {
    return LEARNING_TYPES.find(t => t.value === type) || LEARNING_TYPES[2]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Loading learning items...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Learning Journey
              </h1>
              <p className="text-slate-400">
                Track skills, projects, and concepts you want to learn
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Learning Item
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-4 mb-6"
          >
            <StatCard label="Total" value={stats.total} color="blue" />
            <StatCard label="To Learn" value={stats.toLearn} color="slate" />
            <StatCard label="In Progress" value={stats.inProgress} color="amber" />
            <StatCard label="Completed" value={stats.completed} color="emerald" />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Types</option>
                {LEARNING_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Filter className="w-4 h-4" />
                <span>{filteredItems.length} of {items.length}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Learning Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 text-slate-500"
              >
                No learning items found
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <LearningCard
                  key={item.id}
                  item={item}
                  index={index}
                  onStatusChange={handleStatusChange}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  deleteId={deleteId}
                  getTypeConfig={getTypeConfig}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <LearningModal
            editingItem={editingItem}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false)
              resetForm()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, color }: any) {
  const colors = {
    blue: 'from-blue-600 to-blue-800 border-blue-500/20',
    slate: 'from-slate-600 to-slate-800 border-slate-500/20',
    amber: 'from-amber-600 to-amber-800 border-amber-500/20',
    emerald: 'from-emerald-600 to-emerald-800 border-emerald-500/20',
  }

  return (
    <div className={cn('bg-gradient-to-br border backdrop-blur-sm rounded-xl p-6 shadow-xl', colors[color as keyof typeof colors])}>
      <p className="text-sm text-white/70 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

// Learning Card Component (continued in next message due to length)
function LearningCard({ item, index, onStatusChange, onEdit, onDelete, deleteId, getTypeConfig }: any) {
  const typeConfig = getTypeConfig(item.type)
  const Icon = typeConfig.icon

  const priorityColors = {
    LOW: 'bg-blue-500/20 text-blue-300',
    MEDIUM: 'bg-amber-500/20 text-amber-300',
    HIGH: 'bg-red-500/20 text-red-300',
  }

  const statusColors = {
    TO_LEARN: 'bg-slate-500/20 text-slate-300',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300',
    ON_HOLD: 'bg-amber-500/20 text-amber-300',
  }

  const colorClasses = {
    emerald: 'from-emerald-600 to-emerald-800 border-emerald-500/20',
    purple: 'from-purple-600 to-purple-800 border-purple-500/20',
    amber: 'from-amber-600 to-amber-800 border-amber-500/20',
    blue: 'from-blue-600 to-blue-800 border-blue-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-gradient-to-br border backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300',
        colorClasses[typeConfig.color as keyof typeof colorClasses]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{item.title}</h3>
            <p className="text-sm text-white/70">{typeConfig.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-medium', priorityColors[item.priority as keyof typeof priorityColors])}>
            {item.priority}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{item.description}</p>
      )}

      <div className="space-y-2 mb-4">
        {item.category && (
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Code className="w-4 h-4" />
            <span>{item.category}</span>
          </div>
        )}
        {item.targetDate && (
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Calendar className="w-4 h-4" />
            <span>Target: {new Date(item.targetDate).toLocaleDateString()}</span>
          </div>
        )}
        {item.resourceUrl && (
          <a
            href={item.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors"
          >
            {item.resourceUrl.includes('youtube') ? (
              <Youtube className="w-4 h-4" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            <span className="underline">View Resource</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-white/70 mb-2">
          <span>Progress</span>
          <span>{item.progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[item.status as keyof typeof statusColors])}>
          {item.status.replace('_', ' ')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          disabled={deleteId === item.id}
          className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleteId === item.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </motion.div>
  )
}

// Modal Component
function LearningModal({ editingItem, formData, setFormData, onSubmit, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingItem ? 'Edit Learning Item' : 'Add Learning Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {LEARNING_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={cn(
                      'p-4 border rounded-lg transition-all',
                      formData.type === type.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    <Icon className="w-6 h-6 text-emerald-400 mb-2" />
                    <p className="font-medium text-white text-sm">{type.label}</p>
                    <p className="text-xs text-slate-400">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
              placeholder="e.g., Learn React Hooks, Build a REST API"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="What do you want to learn and why?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resource URL (YouTube, Course, Docs)
            </label>
            <input
              type="url"
              value={formData.resourceUrl}
              onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="react, hooks, advanced"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Your learning notes and progress..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
