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
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Save,
  X,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  Github,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Resume {
  id: string
  name: string
  description?: string
  targetRole?: string
  isDefault: boolean
  experiences?: Experience[]
  projects?: Project[]
  skills?: SkillCategory[]
  education?: Education[]
  createdAt: string
  updatedAt: string
}

interface Experience {
  id: string
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  bulletPoints: string // JSON array
  order: number
}

interface Project {
  id: string
  name: string
  description?: string
  technologies?: string
  githubUrl?: string
  liveUrl?: string
  startDate?: string
  endDate?: string
  bulletPoints: string // JSON array
  order: number
}

interface SkillCategory {
  id: string
  name: string
  skills: string // JSON array
  order: number
}

interface Education {
  id: string
  school: string
  degree: string
  field?: string
  location?: string
  startDate: string
  endDate?: string
  gpa?: string
  achievements?: string // JSON array
  order: number
}

export default function ResumesBuilderPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'experience' | 'projects' | 'skills' | 'education'>('experience')

  // Modal states
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)

  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingSkill, setEditingSkill] = useState<SkillCategory | null>(null)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)

  // Form states
  const [resumeForm, setResumeForm] = useState({
    name: '',
    description: '',
    targetRole: '',
    isDefault: false
  })

  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    bulletPoints: ['', '', '']
  })

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: '',
    bulletPoints: ['', '', '']
  })

  const [skillForm, setSkillForm] = useState({
    name: '',
    skills: ['']
  })

  const [educationForm, setEducationForm] = useState({
    school: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    achievements: ['']
  })

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes-new')
      const data = await response.json()
      setResumes(data)

      // Update selected resume if it exists
      if (selectedResume) {
        const updatedSelectedResume = data.find((r: Resume) => r.id === selectedResume.id)
        if (updatedSelectedResume) {
          setSelectedResume(updatedSelectedResume)
        }
      } else if (data.length > 0) {
        setSelectedResume(data[0])
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResume = async () => {
    try {
      const response = await fetch('/api/resumes-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeForm)
      })
      if (response.ok) {
        await fetchResumes()
        setShowResumeModal(false)
        setResumeForm({ name: '', description: '', targetRole: '', isDefault: false })
      }
    } catch (error) {
      console.error('Error creating resume:', error)
    }
  }

  const handleCreateExperience = async () => {
    if (!selectedResume) {
      alert('Please select a resume first')
      return
    }

    try {
      const payload = {
        ...experienceForm,
        resumeId: selectedResume.id,
        bulletPoints: JSON.stringify(experienceForm.bulletPoints.filter(b => b.trim()))
      }

      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()

      if (response.ok) {
        await fetchResumes()
        setShowExperienceModal(false)
        setExperienceForm({
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          bulletPoints: ['', '', '']
        })
      } else {
        console.error('Failed to create experience:', responseData)
        alert('Failed to create experience: ' + (responseData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating experience:', error)
      alert('Error creating experience. Check console for details.')
    }
  }

  const handleCreateProject = async () => {
    if (!selectedResume) {
      alert('Please select a resume first')
      return
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          resumeId: selectedResume.id,
          bulletPoints: JSON.stringify(projectForm.bulletPoints.filter(b => b.trim()))
        })
      })
      const responseData = await response.json()
      if (response.ok) {
        await fetchResumes()
        setShowProjectModal(false)
        setProjectForm({
          name: '',
          description: '',
          technologies: '',
          githubUrl: '',
          liveUrl: '',
          startDate: '',
          endDate: '',
          bulletPoints: ['', '', '']
        })
      } else {
        alert('Failed to create project: ' + (responseData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Check console for details.')
    }
  }

  const handleCreateSkill = async () => {
    if (!selectedResume) {
      alert('Please select a resume first')
      return
    }

    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...skillForm,
          resumeId: selectedResume.id,
          skills: JSON.stringify(skillForm.skills.filter(s => s.trim()))
        })
      })
      const responseData = await response.json()
      if (response.ok) {
        await fetchResumes()
        setShowSkillModal(false)
        setSkillForm({ name: '', skills: [''] })
      } else {
        alert('Failed to create skill: ' + (responseData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating skill category:', error)
      alert('Error creating skill. Check console for details.')
    }
  }

  const handleCreateEducation = async () => {
    if (!selectedResume) {
      alert('Please select a resume first')
      return
    }

    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...educationForm,
          resumeId: selectedResume.id,
          achievements: educationForm.achievements.filter(a => a.trim()).length > 0
            ? JSON.stringify(educationForm.achievements.filter(a => a.trim()))
            : null
        })
      })
      const responseData = await response.json()
      if (response.ok) {
        await fetchResumes()
        setShowEducationModal(false)
        setEducationForm({
          school: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          achievements: ['']
        })
      } else {
        alert('Failed to create education: ' + (responseData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating education:', error)
      alert('Error creating education. Check console for details.')
    }
  }

  // Delete handlers
  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const response = await fetch(`/api/experiences/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchResumes()
      } else {
        alert('Failed to delete experience')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      alert('Error deleting experience')
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchResumes()
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    }
  }

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill category?')) return

    try {
      const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchResumes()
      } else {
        alert('Failed to delete skill')
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
      alert('Error deleting skill')
    }
  }

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return

    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchResumes()
      } else {
        alert('Failed to delete education')
      }
    } catch (error) {
      console.error('Error deleting education:', error)
      alert('Error deleting education')
    }
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
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  Resume Builder
                </h1>
                <p className="text-slate-400 text-sm mt-1">Build structured resumes with sections and bullet points</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResumeModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Resume
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No resumes yet</p>
            <p className="text-slate-500 text-sm">Create your first resume to get started!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar - Resume List */}
            <div className="col-span-12 lg:col-span-3 space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-3">Your Resumes</h2>
              {resumes.map((resume) => (
                <motion.button
                  key={resume.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedResume(resume)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedResume?.id === resume.id
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{resume.name}</h3>
                    {resume.isDefault && (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  {resume.targetRole && (
                    <p className="text-xs text-slate-400">{resume.targetRole}</p>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              {selectedResume && (
                <div className="space-y-6">
                  {/* Resume Header */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedResume.name}</h2>
                        {selectedResume.description && (
                          <p className="text-slate-400">{selectedResume.description}</p>
                        )}
                        {selectedResume.targetRole && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                            <Award className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300">{selectedResume.targetRole}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex border-b border-white/10">
                      {[
                        { id: 'experience', label: 'Experience', icon: Briefcase, count: selectedResume.experiences?.length || 0 },
                        { id: 'projects', label: 'Projects', icon: Code, count: selectedResume.projects?.length || 0 },
                        { id: 'skills', label: 'Skills', icon: Award, count: selectedResume.skills?.length || 0 },
                        { id: 'education', label: 'Education', icon: GraduationCap, count: selectedResume.education?.length || 0 },
                      ].map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-4 py-4 text-sm font-medium transition-all ${
                              activeTab === tab.id
                                ? 'bg-white/10 text-white border-b-2 border-blue-500'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Icon className="w-4 h-4" />
                              {tab.label}
                              <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{tab.count}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="p-6">
                      {/* Experience Tab */}
                      {activeTab === 'experience' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Work Experience</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowExperienceModal(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Experience
                            </motion.button>
                          </div>

                          {selectedResume.experiences && selectedResume.experiences.length > 0 ? (
                            <div className="space-y-4">
                              {selectedResume.experiences.map((exp) => (
                                <div key={exp.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-white">{exp.position}</h4>
                                      <p className="text-blue-400">{exp.company}</p>
                                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5" />
                                          {exp.startDate} - {exp.endDate || 'Present'}
                                        </div>
                                        {exp.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {exp.location}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDeleteExperience(exp.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <ul className="space-y-2">
                                    {JSON.parse(exp.bulletPoints).map((bullet: string, i: number) => (
                                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                                        <span className="text-blue-400">•</span>
                                        <span>{bullet}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No work experience added yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Projects Tab */}
                      {activeTab === 'projects' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Projects</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowProjectModal(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Project
                            </motion.button>
                          </div>

                          {selectedResume.projects && selectedResume.projects.length > 0 ? (
                            <div className="space-y-4">
                              {selectedResume.projects.map((project) => (
                                <div key={project.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-white">{project.name}</h4>
                                      {project.description && (
                                        <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                                      )}
                                      {project.technologies && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {project.technologies.split(',').map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                                              {tech.trim()}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex gap-3 mt-2">
                                        {project.githubUrl && (
                                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                                            <Github className="w-3.5 h-3.5" />
                                            GitHub
                                          </a>
                                        )}
                                        {project.liveUrl && (
                                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                                            <Globe className="w-3.5 h-3.5" />
                                            Live Demo
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <ul className="space-y-2">
                                    {JSON.parse(project.bulletPoints).map((bullet: string, i: number) => (
                                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span>{bullet}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No projects added yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills Tab */}
                      {activeTab === 'skills' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Skills</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowSkillModal(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Skill Category
                            </motion.button>
                          </div>

                          {selectedResume.skills && selectedResume.skills.length > 0 ? (
                            <div className="space-y-4">
                              {selectedResume.skills.map((skillCat) => (
                                <div key={skillCat.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-white mb-3">{skillCat.name}</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {JSON.parse(skillCat.skills).map((skill: string, i: number) => (
                                          <span key={i} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSkill(skillCat.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No skills added yet</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Education Tab */}
                      {activeTab === 'education' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Education</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowEducationModal(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Education
                            </motion.button>
                          </div>

                          {selectedResume.education && selectedResume.education.length > 0 ? (
                            <div className="space-y-4">
                              {selectedResume.education.map((edu) => (
                                <div key={edu.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-white">{edu.degree}{edu.field && ` in ${edu.field}`}</h4>
                                      <p className="text-emerald-400">{edu.school}</p>
                                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5" />
                                          {edu.startDate} - {edu.endDate || 'Present'}
                                        </div>
                                        {edu.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {edu.location}
                                          </div>
                                        )}
                                        {edu.gpa && (
                                          <span>GPA: {edu.gpa}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEducation(edu.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {edu.achievements && (
                                    <ul className="space-y-2 mt-3">
                                      {JSON.parse(edu.achievements).map((achievement: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                                          <span className="text-emerald-400">•</span>
                                          <span>{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No education added yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Resume Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResumeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Resume</h2>
                <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Resume Name</label>
                  <input
                    type="text"
                    value={resumeForm.name}
                    onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })}
                    placeholder="e.g., Machine Learning Resume"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={resumeForm.description}
                    onChange={(e) => setResumeForm({ ...resumeForm, description: e.target.value })}
                    placeholder="Brief description"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Role (Optional)</label>
                  <input
                    type="text"
                    value={resumeForm.targetRole}
                    onChange={(e) => setResumeForm({ ...resumeForm, targetRole: e.target.value })}
                    placeholder="e.g., ML Engineer, SDE Intern"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={resumeForm.isDefault}
                    onChange={(e) => setResumeForm({ ...resumeForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-slate-300">Set as default resume</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateResume}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Create Resume
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience Modal */}
      <AnimatePresence>
        {showExperienceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExperienceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Work Experience</h2>
                <button onClick={() => setShowExperienceModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                    <input
                      type="text"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      placeholder="e.g., Google"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                    <input
                      type="text"
                      value={experienceForm.position}
                      onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                      placeholder="e.g., Software Engineer"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location (Optional)</label>
                  <input
                    type="text"
                    value={experienceForm.location}
                    onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input
                      type="text"
                      value={experienceForm.startDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                      placeholder="e.g., Jan 2023"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date (Optional)</label>
                    <input
                      type="text"
                      value={experienceForm.endDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                      placeholder="e.g., Present"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bullet Points</label>
                  <div className="space-y-2">
                    {experienceForm.bulletPoints.map((bullet, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...experienceForm.bulletPoints]
                            newBullets[index] = e.target.value
                            setExperienceForm({ ...experienceForm, bulletPoints: newBullets })
                          }}
                          placeholder={`Bullet point ${index + 1}`}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {experienceForm.bulletPoints.length > 1 && (
                          <button
                            onClick={() => {
                              const newBullets = experienceForm.bulletPoints.filter((_, i) => i !== index)
                              setExperienceForm({ ...experienceForm, bulletPoints: newBullets })
                            }}
                            className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setExperienceForm({
                        ...experienceForm,
                        bulletPoints: [...experienceForm.bulletPoints, '']
                      })}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add more
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowExperienceModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateExperience}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Experience
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Project</h2>
                <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g., E-commerce Platform"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Brief description of the project"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Technologies (Optional)</label>
                  <input
                    type="text"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">GitHub URL (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.githubUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Live URL (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                      placeholder="e.g., Jan 2023"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      placeholder="e.g., Mar 2023"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bullet Points</label>
                  <div className="space-y-2">
                    {projectForm.bulletPoints.map((bullet, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...projectForm.bulletPoints]
                            newBullets[index] = e.target.value
                            setProjectForm({ ...projectForm, bulletPoints: newBullets })
                          }}
                          placeholder={`Bullet point ${index + 1}`}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {projectForm.bulletPoints.length > 1 && (
                          <button
                            onClick={() => {
                              const newBullets = projectForm.bulletPoints.filter((_, i) => i !== index)
                              setProjectForm({ ...projectForm, bulletPoints: newBullets })
                            }}
                            className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setProjectForm({
                        ...projectForm,
                        bulletPoints: [...projectForm.bulletPoints, '']
                      })}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add more
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkillModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Skill Category</h2>
                <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    placeholder="e.g., Programming Languages, Frameworks"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                  <div className="space-y-2">
                    {skillForm.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...skillForm.skills]
                            newSkills[index] = e.target.value
                            setSkillForm({ ...skillForm, skills: newSkills })
                          }}
                          placeholder={`Skill ${index + 1}`}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {skillForm.skills.length > 1 && (
                          <button
                            onClick={() => {
                              const newSkills = skillForm.skills.filter((_, i) => i !== index)
                              setSkillForm({ ...skillForm, skills: newSkills })
                            }}
                            className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setSkillForm({
                        ...skillForm,
                        skills: [...skillForm.skills, '']
                      })}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add more
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowSkillModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSkill}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Skills
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {showEducationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEducationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Education</h2>
                <button onClick={() => setShowEducationModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">School</label>
                    <input
                      type="text"
                      value={educationForm.school}
                      onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                      placeholder="e.g., MIT"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Degree</label>
                    <input
                      type="text"
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Field of Study (Optional)</label>
                    <input
                      type="text"
                      value={educationForm.field}
                      onChange={(e) => setEducationForm({ ...educationForm, field: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      value={educationForm.location}
                      onChange={(e) => setEducationForm({ ...educationForm, location: e.target.value })}
                      placeholder="e.g., Cambridge, MA"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input
                      type="text"
                      value={educationForm.startDate}
                      onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                      placeholder="e.g., Aug 2020"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date (Optional)</label>
                    <input
                      type="text"
                      value={educationForm.endDate}
                      onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                      placeholder="e.g., May 2024"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">GPA (Optional)</label>
                    <input
                      type="text"
                      value={educationForm.gpa}
                      onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
                      placeholder="e.g., 3.8/4.0"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Achievements (Optional)</label>
                  <div className="space-y-2">
                    {educationForm.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...educationForm.achievements]
                            newAchievements[index] = e.target.value
                            setEducationForm({ ...educationForm, achievements: newAchievements })
                          }}
                          placeholder={`Achievement ${index + 1}`}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {educationForm.achievements.length > 1 && (
                          <button
                            onClick={() => {
                              const newAchievements = educationForm.achievements.filter((_, i) => i !== index)
                              setEducationForm({ ...educationForm, achievements: newAchievements })
                            }}
                            className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setEducationForm({
                        ...educationForm,
                        achievements: [...educationForm.achievements, '']
                      })}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add more
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEducationModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEducation}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Education
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
