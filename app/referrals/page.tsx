'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Contact {
  id: string
  name: string
  linkedinUrl?: string
  email?: string
  position?: string
  status: string
  company: {
    id: string
    name: string
  }
  _count: {
    referredApplications: number
  }
}

export default function ReferralsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferralContacts()
  }, [])

  const fetchReferralContacts = async () => {
    try {
      const response = await fetch('/api/contacts?canRefer=true')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching referral contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group contacts by company
  const contactsByCompany = contacts.reduce((acc, contact) => {
    const companyName = contact.company.name
    if (!acc[companyName]) {
      acc[companyName] = []
    }
    acc[companyName].push(contact)
    return acc
  }, {} as Record<string, Contact[]>)

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white text-center">Loading referral contacts...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">🎯 Your Referral Network</h1>
          <p className="text-gray-400 mt-2">
            Your weapons for job hunting - contacts who can refer you
          </p>
        </div>
        <Link
          href="/"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Total Referral Contacts</p>
          <p className="text-4xl font-bold text-green-400 mt-2">{contacts.length}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Companies Covered</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">
            {Object.keys(contactsByCompany).length}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Successful Referrals</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">
            {contacts.reduce((acc, c) => acc + c._count.referredApplications, 0)}
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-lg p-12 border border-[#2a2a2a] text-center">
          <p className="text-gray-400 text-lg">
            No referral contacts yet. Start building your network on the{' '}
            <Link href="/contacts" className="text-blue-400 hover:text-blue-300">
              Contacts page
            </Link>
            !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(contactsByCompany).map(([companyName, companyContacts]) => (
            <div
              key={companyName}
              className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden"
            >
              <div className="bg-[#0f0f0f] p-4 border-b border-[#2a2a2a]">
                <h2 className="text-xl font-semibold text-white">{companyName}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''} can
                  refer you
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {contact.name}
                          </h3>
                          {contact.position && (
                            <p className="text-sm text-gray-400 mt-1">{contact.position}</p>
                          )}
                          {contact.email && (
                            <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                          )}
                          <div className="mt-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                contact.status === 'CONNECTED'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : contact.status === 'MESSAGED'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : contact.status === 'REPLIED'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {contact.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {contact._count.referredApplications > 0 && (
                            <p className="text-sm text-green-400 mt-2">
                              ✓ Referred you {contact._count.referredApplications} time
                              {contact._count.referredApplications !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        {contact.linkedinUrl && (
                          <a
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            LinkedIn →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
