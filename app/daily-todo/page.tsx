'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, StickyNote, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  notes?: string
  dueDate: string
  isCompleted: boolean
  completedAt?: string
  subtasks: Task[]
}

export default function DailyTodoPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewDate, setViewDate] = useState<Date | null>(null) // For viewing tasks on specific dates
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    dueDate: '',
    parentTaskId: '',
  })

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
    const method = editingTask ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          notes: formData.notes || null,
          dueDate: formData.dueDate,
          parentTaskId: formData.parentTaskId || null,
        }),
      })

      if (response.ok) {
        await fetchTasks()
        setShowAddModal(false)
        setEditingTask(null)
        setFormData({ title: '', notes: '', dueDate: '', parentTaskId: '' })
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Helper to format date for input (YYYY-MM-DD) without timezone shift
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const openAddModal = (parentTask?: Task, dueDate?: Date) => {
    setFormData({
      title: '',
      notes: '',
      dueDate: formatDateForInput(dueDate || today),
      parentTaskId: parentTask?.id || '',
    })
    setEditingTask(null)
    setShowAddModal(true)
  }

  const openEditModal = (task: Task) => {
    setFormData({
      title: task.title,
      notes: task.notes || '',
      dueDate: formatDateForInput(new Date(task.dueDate)),
      parentTaskId: '',
    })
    setEditingTask(task)
    setShowAddModal(true)
  }

  const filterTasksByDate = (date: Date) => {
    const targetDate = formatDateForInput(date)

    return tasks.filter((task) => {
      const taskDate = formatDateForInput(new Date(task.dueDate))
      return taskDate === targetDate
    })
  }

  const todayTasks = filterTasksByDate(today)
  const tomorrowTasks = filterTasksByDate(tomorrow)

  // Calendar generation
  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const calendar: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(i)
    }

    return calendar
  }

  const changeMonth = (direction: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1))
  }

  const getTaskCountForDay = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    return filterTasksByDate(date).length
  }

  const isToday = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            My Daily To-Do
          </h1>
          <p className="text-slate-400">Stay organized and track your daily tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {generateCalendar().map((day, index) => {
                  const taskCount = day ? getTaskCountForDay(day) : 0
                  const today = day ? isToday(day) : false

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day) {
                          const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                          setViewDate(date)
                        }
                      }}
                      disabled={!day}
                      className={cn(
                        'aspect-square rounded-lg text-sm font-medium transition-all relative',
                        day
                          ? 'bg-white/5 hover:bg-white/10 text-white'
                          : 'bg-transparent text-transparent cursor-default',
                        today && 'bg-blue-500/20 border-2 border-blue-500',
                        viewDate && day === viewDate.getDate() && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear() && 'bg-purple-500/30 border-2 border-purple-500'
                      )}
                    >
                      {day}
                      {taskCount > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tasks View */}
          <div className="lg:col-span-2 space-y-6">
            {viewDate ? (
              /* Selected Date Tasks */
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6 text-purple-400" />
                      Tasks for {viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {viewDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewDate(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                    >
                      <X className="w-5 h-5" />
                      Close
                    </button>
                    <button
                      onClick={() => openAddModal(undefined, viewDate)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Task
                    </button>
                  </div>
                </div>

                <TaskList
                  tasks={filterTasksByDate(viewDate)}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onAddSubtask={openAddModal}
                />
              </div>
            ) : (
              <>
                {/* Today's Tasks */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-blue-400" />
                        Today's Tasks
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => openAddModal(undefined, today)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Task
                    </button>
                  </div>

                  <TaskList
                    tasks={todayTasks}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onEdit={openEditModal}
                    onAddSubtask={openAddModal}
                  />
                </div>

                {/* Tomorrow's Tasks */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-purple-400" />
                        Tomorrow's Tasks
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        {tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => openAddModal(undefined, tomorrow)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Task
                    </button>
                  </div>

                  <TaskList
                    tasks={tomorrowTasks}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onEdit={openEditModal}
                    onAddSubtask={openAddModal}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  {editingTask ? 'Edit Task' : formData.parentTaskId ? 'Add Subtask' : 'Add New Task'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add any notes or details..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
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

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: string, isCompleted: boolean) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onAddSubtask: (parentTask: Task) => void
}

function TaskList({ tasks, onToggleComplete, onDelete, onEdit, onAddSubtask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No tasks scheduled</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task.id, task.isCompleted)}
              className={cn(
                'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                task.isCompleted
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/30 hover:border-white/50'
              )}
            >
              {task.isCompleted && <Check className="w-3 h-3 text-white" />}
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'text-lg font-semibold',
                  task.isCompleted ? 'line-through text-slate-500' : 'text-white'
                )}
              >
                {task.title}
              </h3>
              {task.notes && (
                <div className="flex items-start gap-2 mt-2 text-sm text-slate-400">
                  <StickyNote className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{task.notes}</p>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3 space-y-2 pl-4 border-l-2 border-white/10">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleComplete(subtask.id, subtask.isCompleted)}
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                          subtask.isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/30 hover:border-white/50'
                        )}
                      >
                        {subtask.isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                      </button>
                      <span
                        className={cn(
                          'text-sm',
                          subtask.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'
                        )}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => onDelete(subtask.id)}
                        className="ml-auto p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onAddSubtask(task)}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Add subtask
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
