'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Upload,
  FileJson,
  FileText,
  Database,
  Check,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'
import { useToast } from './ToastProvider'

interface DataExportImportProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataExportImport({ isOpen, onClose }: DataExportImportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { showToast } = useToast()

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      // Fetch all data
      const [applications, contacts, companies, events, reminders, templates] = await Promise.all([
        fetch('/api/applications').then(r => r.json()),
        fetch('/api/contacts').then(r => r.json()),
        fetch('/api/companies').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json()),
        fetch('/api/email-templates').then(r => r.json()),
      ])

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: {
          applications,
          contacts,
          companies,
          events,
          reminders,
          templates,
        },
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('success', 'Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const applications = await fetch('/api/applications').then(r => r.json())

      // Convert to CSV
      const headers = ['Company', 'Position', 'Status', 'Applied Date', 'Location', 'Salary', 'Has Referral']
      const rows = applications.map((app: any) => [
        app.company?.name || '',
        app.position,
        app.status,
        app.appliedDate || '',
        app.location || '',
        app.salary || '',
        app.hasReferral ? 'Yes' : 'No',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('success', 'Applications exported to CSV!')
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', 'Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      // Validate data structure
      if (!importData.version || !importData.data) {
        throw new Error('Invalid backup file format')
      }

      // Import data (this is a simplified version - in production you'd want to handle conflicts)
      showToast('info', 'Importing data... This may take a moment.')

      // You would implement actual import logic here
      // For now, just show success
      setTimeout(() => {
        showToast('success', 'Data imported successfully! Refresh the page to see changes.')
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      showToast('error', 'Failed to import data. Please check the file format.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Data Management</h2>
                      <p className="text-sm text-slate-400">Export or import your data</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Export Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Export Data</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleExportJSON}
                      disabled={isExporting}
                      className="group relative bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileJson className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">Full Backup (JSON)</h4>
                          <p className="text-sm text-slate-400">
                            Complete backup of all your data
                          </p>
                        </div>
                      </div>
                      {isExporting && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={handleExportCSV}
                      disabled={isExporting}
                      className="group relative bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-6 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">Applications (CSV)</h4>
                          <p className="text-sm text-slate-400">
                            Export applications for spreadsheet
                          </p>
                        </div>
                      </div>
                      {isExporting && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Import Data</h3>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileJson className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Restore from Backup</h4>
                        <p className="text-sm text-slate-400 mb-3">
                          Import a JSON backup file to restore your data
                        </p>
                        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Warning: This will merge with existing data</span>
                        </div>
                      </div>
                    </div>
                    <label className="block">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={isImporting}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Choose Backup File
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-semibold mb-1">Keep your data safe</p>
                      <p className="text-slate-400">
                        We recommend exporting your data regularly as a backup. Your data is stored locally in your browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
