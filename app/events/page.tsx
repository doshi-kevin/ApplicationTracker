'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  FileText,
  Check,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Briefcase,
  User,
  Target,
  Lightbulb,
  Phone,
  Search,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper function to convert date to local datetime-local format without timezone shift
function toLocalDateTimeString(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

interface Company {
  id: string
  name: string
}

interface Application {
  id: string
  positionTitle: string
  company: Company
}

interface Contact {
  id: string
  name: string
  company: Company
}

interface Event {
  id: string
  type: string
  applicationId?: string
  application?: Application
  contactId?: string
  contact?: Contact
  title: string
  description?: string
  scheduledDate: string
  duration?: number
  round?: number
  interviewers?: string
  location?: string
  meetingLink?: string
  status: string
  isCompleted: boolean
  completedAt?: string
  feedback?: string
  notes?: string
  outcome?: string
  nextSteps?: string
  nextStepsDueDate?: string
}

interface NextStep {
  text: string
  completed: boolean
}

const EVENT_TYPES = [
  { value: 'INTERVIEW', label: 'Interview', icon: Briefcase, color: 'purple' },
  { value: 'NETWORKING_CALL', label: 'Networking Call', icon: Phone, color: 'blue' },
  { value: 'REMINDER', label: 'Reminder', icon: AlertCircle, color: 'amber' },
  { value: 'TODO', label: 'To-Do', icon: Target, color: 'green' },
]

const EVENT_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Outcome modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)
  const [completingEvent, setCompletingEvent] = useState<Event | null>(null)
  const [outcomeData, setOutcomeData] = useState({
    outcome: '',
    nextSteps: [] as NextStep[],
    nextStepsDueDate: ''
  })
  const [nextStepInput, setNextStepInput] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [completedFilter, setCompletedFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    type: 'REMINDER',
    applicationId: '',
    contactId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: '',
    round: '',
    interviewers: '',
    location: '',
    meetingLink: '',
    status: 'PENDING',
    notes: '',
  })

  // Filtered events - MUST be before early return
  const filteredEvents = useMemo<Event[]>(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return []
    }

    return events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (event.application?.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (event.contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)

      const matchesType = typeFilter === 'all' || event.type === typeFilter
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      const matchesCompleted =
        completedFilter === 'all' ||
        (completedFilter === 'completed' && event.isCompleted) ||
        (completedFilter === 'pending' && !event.isCompleted)

      return matchesSearch && matchesType && matchesStatus && matchesCompleted
    })
  }, [events, searchTerm, typeFilter, statusFilter, completedFilter])

  const upcomingEvents = useMemo<Event[]>(() => {
    return filteredEvents.filter(e => new Date(e.scheduledDate) >= new Date() && !e.isCompleted)
  }, [filteredEvents])

  const pastEvents = useMemo<Event[]>(() => {
    return filteredEvents.filter(e => new Date(e.scheduledDate) < new Date() || e.isCompleted)
  }, [filteredEvents])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, appsRes, contactsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/applications'),
        fetch('/api/contacts'),
      ])

      const eventsData = await eventsRes.json()
      const appsData = await appsRes.json()
      const contactsData = await contactsRes.json()

      setEvents(eventsData)
      setApplications(appsData)
      setContacts(contactsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PATCH' : 'POST'

      // Convert datetime-local to ISO string, treating it as local time
      // Add seconds to make it a complete datetime that Prisma accepts
      const scheduledDateWithSeconds = formData.scheduledDate.includes(':00:00')
        ? formData.scheduledDate
        : `${formData.scheduledDate}:00`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDateWithSeconds,
          applicationId: formData.applicationId || null,
          contactId: formData.contactId || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          round: formData.round ? parseInt(formData.round) : null,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleToggleComplete = async (event: Event) => {
    if (!event.isCompleted) {
      // Opening outcome modal when marking as complete
      setCompletingEvent(event)
      setOutcomeData({ outcome: '', nextSteps: [], nextStepsDueDate: '' })
      setNextStepInput('')
      setShowOutcomeModal(true)
    } else {
      // Uncompleting - just toggle
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: false, outcome: null, nextSteps: null, nextStepsDueDate: null }),
        })

        if (response.ok) {
          await fetchData()
        }
      } catch (error) {
        console.error('Error toggling completion:', error)
      }
    }
  }

  const handleSubmitOutcome = async () => {
    if (!completingEvent) return

    try {
      const response = await fetch(`/api/events/${completingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCompleted: true,
          outcome: outcomeData.outcome,
          nextSteps: JSON.stringify(outcomeData.nextSteps),
          nextStepsDueDate: outcomeData.nextStepsDueDate,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowOutcomeModal(false)
        setCompletingEvent(null)
        setOutcomeData({ outcome: '', nextSteps: [], nextStepsDueDate: '' })
        setNextStepInput('')
      }
    } catch (error) {
      console.error('Error submitting outcome:', error)
    }
  }

  const handleToggleNextStep = async (event: Event, stepIndex: number) => {
    try {
      const steps: NextStep[] = event.nextSteps ? JSON.parse(event.nextSteps) : []
      steps[stepIndex].completed = !steps[stepIndex].completed

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextSteps: JSON.stringify(steps),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // If deleted, refresh data
        if (result.deleted) {
          await fetchData()
        } else {
          await fetchData()
        }
      }
    } catch (error) {
      console.error('Error toggling next step:', error)
    }
  }

  const handleUpdateEventDate = async (event: Event, newDate: string) => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: newDate,
        }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating event date:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id)
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setEditingEvent(null)
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      type: event.type,
      applicationId: event.applicationId || '',
      contactId: event.contactId || '',
      title: event.title,
      description: event.description || '',
      scheduledDate: toLocalDateTimeString(event.scheduledDate),
      duration: event.duration?.toString() || '',
      round: event.round?.toString() || '',
      interviewers: event.interviewers || '',
      location: event.location || '',
      meetingLink: event.meetingLink || '',
      status: event.status,
      notes: event.notes || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'REMINDER',
      applicationId: '',
      contactId: '',
      title: '',
      description: '',
      scheduledDate: '',
      duration: '',
      round: '',
      interviewers: '',
      location: '',
      meetingLink: '',
      status: 'PENDING',
      notes: '',
    })
  }

  const getEventIcon = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type)
    return eventType?.icon || AlertCircle
  }

  const getEventColor = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type)
    return eventType?.color || 'gray'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          Loading events...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Interviews & Reminders
              </h1>
              <p className="text-slate-400">
                Manage interviews, networking calls, and general reminders
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </motion.button>
          </motion.div>

          {/* Search and Filters */}
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
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Types</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Statuses</option>
                {EVENT_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={completedFilter}
                onChange={(e) => setCompletedFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Events</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Filter className="w-4 h-4" />
                <span>{filteredEvents.length} of {events.length}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Upcoming</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {upcomingEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12 text-slate-500"
                >
                  No upcoming events
                </motion.div>
              ) : (
                upcomingEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onToggleNextStep={handleToggleNextStep}
                    onUpdateEventDate={handleUpdateEventDate}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deleteId={deleteId}
                    getEventIcon={getEventIcon}
                    getEventColor={getEventColor}
                    formatDate={formatDate}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Past & Completed</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {pastEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12 text-slate-500"
                >
                  No past events
                </motion.div>
              ) : (
                pastEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onToggleNextStep={handleToggleNextStep}
                    onUpdateEventDate={handleUpdateEventDate}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deleteId={deleteId}
                    getEventIcon={getEventIcon}
                    getEventColor={getEventColor}
                    formatDate={formatDate}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <EventModal
            editingEvent={editingEvent}
            formData={formData}
            setFormData={setFormData}
            applications={applications}
            contacts={contacts}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false)
              resetForm()
            }}
          />
        )}
      </AnimatePresence>

      {/* Outcome Modal */}
      <AnimatePresence>
        {showOutcomeModal && (
          <OutcomeModal
            event={completingEvent}
            outcomeData={outcomeData}
            setOutcomeData={setOutcomeData}
            nextStepInput={nextStepInput}
            setNextStepInput={setNextStepInput}
            onSubmit={handleSubmitOutcome}
            onClose={() => {
              setShowOutcomeModal(false)
              setCompletingEvent(null)
              setOutcomeData({ outcome: '', nextSteps: [], nextStepsDueDate: '' })
              setNextStepInput('')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Event Card Component
function EventCard({
  event,
  index,
  onToggleComplete,
  onToggleNextStep,
  onUpdateEventDate,
  onEdit,
  onDelete,
  deleteId,
  getEventIcon,
  getEventColor,
  formatDate,
}: any) {
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [tempDate, setTempDate] = useState('')

  const Icon = getEventIcon(event.type)
  const color = getEventColor(event.type)

  const colorClasses = {
    purple: 'from-purple-600 to-purple-800 border-purple-500/20',
    blue: 'from-blue-600 to-blue-800 border-blue-500/20',
    amber: 'from-amber-600 to-amber-800 border-amber-500/20',
    green: 'from-green-600 to-green-800 border-green-500/20',
    gray: 'from-gray-600 to-gray-800 border-gray-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-gradient-to-br border backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300',
        colorClasses[color as keyof typeof colorClasses],
        event.isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{event.title}</h3>
            <p className="text-sm text-white/70">{EVENT_TYPES.find(t => t.value === event.type)?.label}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleComplete(event)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {event.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-300" />
          ) : (
            <Circle className="w-5 h-5 text-white/50" />
          )}
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm text-white/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {isEditingDate ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="datetime-local"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
              <button
                onClick={() => {
                  onUpdateEventDate(event, tempDate)
                  setIsEditingDate(false)
                }}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingDate(false)}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <span
              onClick={() => {
                const formatted = toLocalDateTimeString(event.scheduledDate)
                setTempDate(formatted)
                setIsEditingDate(true)
              }}
              className="cursor-pointer hover:text-blue-400 transition-colors"
            >
              {formatDate(event.scheduledDate)}
            </span>
          )}
        </div>
        {event.duration && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.duration} minutes</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}
        {event.application && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>{event.application.positionTitle} at {event.application.company.name}</span>
          </div>
        )}
        {event.contact && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{event.contact.name} at {event.contact.company.name}</span>
          </div>
        )}
        {event.description && (
          <p className="text-white/70 line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Outcome Display - shown only for completed events */}
      {event.isCompleted && event.outcome && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-300 mb-1">Outcome</p>
              <p className="text-sm text-white/90">{event.outcome}</p>
            </div>
          </div>
          {event.nextSteps && (() => {
            try {
              const steps: NextStep[] = JSON.parse(event.nextSteps)
              if (steps.length === 0) return null
              return (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-medium text-emerald-300">Next Steps</p>
                    {event.nextStepsDueDate && (
                      <span className="ml-auto text-xs text-emerald-400">
                        Due: {new Date(event.nextStepsDueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 pl-6">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => onToggleNextStep(event, index)}
                          className="w-4 h-4 mt-0.5 rounded border-emerald-500/50 bg-slate-800 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer"
                        />
                        <span className={`text-sm flex-1 ${step.completed ? 'line-through text-white/50' : 'text-white/90'}`}>
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            } catch (e) {
              // Fallback for invalid JSON
              return (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-emerald-500/20">
                  <Target className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-300 mb-1">Next Steps</p>
                    <p className="text-sm text-white/90">{event.nextSteps}</p>
                  </div>
                </div>
              )
            }
          })()}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(event)}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(event.id)}
          disabled={deleteId === event.id}
          className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleteId === event.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </motion.div>
  )
}

// Modal Component
function EventModal({
  editingEvent,
  formData,
  setFormData,
  applications,
  contacts,
  onSubmit,
  onClose,
}: any) {
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
            {editingEvent ? 'Edit Event' : 'Create Event'}
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
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            >
              {EVENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
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
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Link to Application (optional)
            </label>
            <select
              value={formData.applicationId}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">None</option>
              {applications.map((app: Application) => (
                <option key={app.id} value={app.id}>
                  {app.positionTitle} at {app.company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Link to Contact (optional)
            </label>
            <select
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">None</option>
              {contacts.map((contact: Contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} at {contact.company.name}
                </option>
              ))}
            </select>
          </div>

          {formData.type === 'INTERVIEW' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Round
                  </label>
                  <input
                    type="number"
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="1, 2, 3..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Zoom, Google Meet, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Interviewers
                </label>
                <input
                  type="text"
                  value={formData.interviewers}
                  onChange={(e) => setFormData({ ...formData, interviewers: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Comma-separated names"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}


// Outcome Modal Component
function OutcomeModal({ event, outcomeData, setOutcomeData, nextStepInput, setNextStepInput, onSubmit, onClose }: any) {
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
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Event Completed!</h2>
            <p className="text-slate-400 text-sm mt-1">{event?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What was the outcome? *
            </label>
            <textarea
              value={outcomeData.outcome}
              onChange={(e) => setOutcomeData({ ...outcomeData, outcome: e.target.value })}
              rows={4}
              placeholder="e.g., Got to next round, Received offer, Great networking conversation, Learned about their tech stack..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Next Steps (Optional)
            </label>
            <div className="space-y-2">
              {outcomeData.nextSteps.map((step: NextStep, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
                  <span className="text-slate-400">•</span>
                  <span className="flex-1 text-slate-200 text-sm">{step.text}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSteps = outcomeData.nextSteps.filter((_: NextStep, i: number) => i !== index)
                      setOutcomeData({ ...outcomeData, nextSteps: newSteps })
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nextStepInput}
                  onChange={(e) => setNextStepInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && nextStepInput.trim()) {
                      setOutcomeData({
                        ...outcomeData,
                        nextSteps: [...outcomeData.nextSteps, { text: nextStepInput.trim(), completed: false }]
                      })
                      setNextStepInput('')
                    }
                  }}
                  placeholder="Add a next step (press Enter)"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nextStepInput.trim()) {
                      setOutcomeData({
                        ...outcomeData,
                        nextSteps: [...outcomeData.nextSteps, { text: nextStepInput.trim(), completed: false }]
                      })
                      setNextStepInput('')
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {outcomeData.nextSteps.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Due Date for Next Steps
              </label>
              <input
                type="date"
                value={outcomeData.nextStepsDueDate}
                onChange={(e) => setOutcomeData({ ...outcomeData, nextStepsDueDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!outcomeData.outcome.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
