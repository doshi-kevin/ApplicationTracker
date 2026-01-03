'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Analytics {
  overview: {
    totalApplications: number
    appliedCount: number
    interviewCount: number
    offerCount: number
    rejectedCount: number
    acceptedCount: number
  }
  statusCounts: Record<string, number>
  successRates: {
    referral: string
    nonReferral: string
  }
  avgResponseTime: string
  applicationsPerMonth: Record<string, number>
  topCompanies: Array<{ name: string; count: number }>
  referrableContacts: number
  totalContacts: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white text-center">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-white text-center">Failed to load analytics</div>
      </div>
    )
  }

  const totalApplied = analytics.overview.appliedCount
  const responseRate = totalApplied > 0
    ? ((analytics.overview.interviewCount / totalApplied) * 100).toFixed(1)
    : '0.0'
  const offerRate = totalApplied > 0
    ? ((analytics.overview.offerCount / totalApplied) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-gray-400 mt-2">
            Deep dive into your job search performance
          </p>
        </div>
        <Link
          href="/"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Total Applications</p>
          <p className="text-4xl font-bold text-white mt-2">
            {analytics.overview.totalApplications}
          </p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Interview Rate</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">{responseRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.overview.interviewCount} of {totalApplied} applied
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Offer Rate</p>
          <p className="text-4xl font-bold text-green-400 mt-2">{offerRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.overview.offerCount} offers received
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">Avg Response Time</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">
            {analytics.avgResponseTime}
          </p>
          <p className="text-sm text-gray-500 mt-2">days to hear back</p>
        </div>
      </div>

      {/* Success Rates Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-6">
            Referral Impact
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">With Referral</span>
                <span className="text-green-400 font-bold text-lg">
                  {analytics.successRates.referral}%
                </span>
              </div>
              <div className="w-full bg-[#0f0f0f] rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-400 h-4 rounded-full transition-all"
                  style={{ width: `${analytics.successRates.referral}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Without Referral</span>
                <span className="text-blue-400 font-bold text-lg">
                  {analytics.successRates.nonReferral}%
                </span>
              </div>
              <div className="w-full bg-[#0f0f0f] rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-4 rounded-full transition-all"
                  style={{ width: `${analytics.successRates.nonReferral}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-[#2a2a2a]">
              <p className="text-sm text-gray-400">
                💡 Referrals can significantly increase your chances of success!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-6">
            Application Status Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const percentage = totalApplied > 0
                ? ((count / totalApplied) * 100).toFixed(0)
                : '0'
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">{status.replace(/_/g, ' ')}</span>
                    <span className="text-white font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#0f0f0f] rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Applications Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-6">
            Applications Over Time
          </h2>
          {Object.keys(analytics.applicationsPerMonth).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No application data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.applicationsPerMonth)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([month, count]) => {
                  const maxCount = Math.max(...Object.values(analytics.applicationsPerMonth))
                  const percentage = (count / maxCount) * 100
                  return (
                    <div key={month}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">{month}</span>
                        <span className="text-white font-semibold">{count} applications</span>
                      </div>
                      <div className="w-full bg-[#0f0f0f] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-6">
            Top Companies
          </h2>
          {analytics.topCompanies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No company data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.topCompanies.map((company, index) => {
                const maxCount = analytics.topCompanies[0].count
                const percentage = (company.count / maxCount) * 100
                return (
                  <div key={company.name}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">#{index + 1}</span>
                        <span className="text-white">{company.name}</span>
                      </div>
                      <span className="text-gray-400 font-semibold">
                        {company.count} {company.count === 1 ? 'application' : 'applications'}
                      </span>
                    </div>
                    <div className="w-full bg-[#0f0f0f] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Network Stats */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
        <h2 className="text-xl font-semibold text-white mb-6">
          Your Professional Network
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{analytics.totalContacts}</p>
            <p className="text-gray-400 mt-2">Total Contacts</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-400">{analytics.referrableContacts}</p>
            <p className="text-gray-400 mt-2">Can Refer You</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">
              {analytics.totalContacts > 0
                ? ((analytics.referrableContacts / analytics.totalContacts) * 100).toFixed(0)
                : '0'}
              %
            </p>
            <p className="text-gray-400 mt-2">Referral Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
