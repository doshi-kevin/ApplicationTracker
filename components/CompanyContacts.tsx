'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Mail,
  Phone,
  Linkedin,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ExternalLink,
  Star,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  position?: string
  linkedinUrl?: string
  canRefer: boolean
  notes?: string
  lastContactedDate?: string
  status?: 'connected' | 'pending' | 'replied' | 'no_response'
  company: {
    id: string
    name: string
  }
}

interface CompanyContactsProps {
  companyId: string
  companyName: string
  contacts: Contact[]
  applicationId?: string
  compact?: boolean
}

export default function CompanyContacts({
  companyId,
  companyName,
  contacts,
  applicationId,
  compact = false
}: CompanyContactsProps) {

  const companyContacts = contacts.filter(c => c.company.id === companyId)

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Connected'
        }
      case 'replied':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: <MessageSquare className="w-3 h-3" />,
          label: 'Replied'
        }
      case 'pending':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          icon: <Clock className="w-3 h-3" />,
          label: 'Pending'
        }
      case 'no_response':
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          icon: <XCircle className="w-3 h-3" />,
          label: 'No Response'
        }
      default:
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          icon: <Users className="w-3 h-3" />,
          label: 'Unknown'
        }
    }
  }

  const getTimeSinceContact = (dateString?: string) => {
    if (!dateString) return null

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (companyContacts.length === 0) {
    return (
      <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-slate-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">No Contacts at {companyName}</h3>
            <p className="text-sm text-slate-400 mb-3">
              Build your network at this company to increase your chances!
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Add Contact
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-semibold">
          {companyContacts.length} Contact{companyContacts.length > 1 ? 's' : ''} at {companyName}
        </h3>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {companyContacts.map((contact, index) => {
          const statusConfig = getStatusConfig(contact.status)
          const lastContact = getTimeSinceContact(contact.lastContactedDate)

          return (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-white/10 rounded-xl p-4 backdrop-blur-xl hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar/Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {contact.name}
                        {contact.canRefer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
                            <Star className="w-3 h-3" />
                            Can Refer
                          </span>
                        )}
                      </h4>
                      {contact.position && (
                        <p className="text-sm text-slate-400">{contact.position}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 ${statusConfig.bg} border ${statusConfig.border} rounded-lg`}>
                      {statusConfig.icon}
                      <span className={`text-xs font-medium ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {/* Last Contact Date */}
                  {lastContact && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      Last contacted {lastContact}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {contact.notes && !compact && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {contact.notes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/contacts`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Details
                    </Link>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}?subject=Referral Request for ${companyName}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Ask for Referral
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Helpful Tips */}
      {companyContacts.some(c => c.canRefer) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600/10 to-green-600/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-emerald-400 font-medium mb-1">
                Referral Opportunity Available!
              </p>
              <p className="text-xs text-slate-400">
                You have contacts who can refer you. Referrals increase your chances by 3-5x. Reach out with a personalized message!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      {!compact && companyContacts.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {companyContacts.filter(c => c.status === 'connected').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Connected</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {companyContacts.filter(c => c.status === 'replied').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Replied</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {companyContacts.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Pending</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {companyContacts.filter(c => c.canRefer).length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Can Refer</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for application cards
export function CompanyContactsBadge({
  companyId,
  contacts
}: {
  companyId: string
  contacts: Contact[]
}) {
  const companyContacts = contacts.filter(c => c.company.id === companyId)
  const canReferCount = companyContacts.filter(c => c.canRefer).length

  if (companyContacts.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
        <Users className="w-3 h-3 text-purple-400" />
        <span className="text-xs font-medium text-purple-400">
          {companyContacts.length} contact{companyContacts.length > 1 ? 's' : ''}
        </span>
      </div>
      {canReferCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
          <Star className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            {canReferCount} can refer
          </span>
        </div>
      )}
    </div>
  )
}
