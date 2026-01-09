'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/LoadingSkeletons'

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
    return <DashboardSkeleton />
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Analytics & Insights
          </h1>
          <p className="text-slate-400 mt-2">
            Deep dive into your job search performance
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="group relative bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all backdrop-blur-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Applications</p>
          <p className="text-4xl font-bold text-white mt-2">
            {analytics.overview.totalApplications}
          </p>
          <p className="text-sm text-slate-500 mt-2">All time</p>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="group relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all backdrop-blur-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Interview Rate</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">{responseRate}%</p>
          <p className="text-sm text-slate-500 mt-2">
            {analytics.overview.interviewCount} of {totalApplied} applied
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="group relative bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all backdrop-blur-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Offer Rate</p>
          <p className="text-4xl font-bold text-emerald-400 mt-2">{offerRate}%</p>
          <p className="text-sm text-slate-500 mt-2">
            {analytics.overview.offerCount} offers received
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 rounded-2xl transition-all" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="group relative bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all backdrop-blur-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <TrendingDown className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Avg Response Time</p>
          <p className="text-4xl font-bold text-amber-400 mt-2">
            {analytics.avgResponseTime}
          </p>
          <p className="text-sm text-slate-500 mt-2">days to hear back</p>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 rounded-2xl transition-all" />
        </motion.div>
      </div>

      {/* Success Rates Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">
              Referral Impact
            </h2>
          </div>
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
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Referrals can significantly increase your chances of success!
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Application Status Breakdown
            </h2>
          </div>
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
        </motion.div>
      </div>

      {/* Applications Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">
              Applications Over Time
            </h2>
          </div>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Top Companies
            </h2>
          </div>
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
        </motion.div>
      </div>

      {/* Network Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-semibold text-white">
            Your Professional Network
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="text-center bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-5xl font-bold text-blue-400">{analytics.totalContacts}</p>
            <p className="text-slate-400 mt-2 font-medium">Total Contacts</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-5xl font-bold text-emerald-400">{analytics.referrableContacts}</p>
            <p className="text-slate-400 mt-2 font-medium">Can Refer You</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-5xl font-bold text-purple-400">
              {analytics.totalContacts > 0
                ? ((analytics.referrableContacts / analytics.totalContacts) * 100).toFixed(0)
                : '0'}
              %
            </p>
            <p className="text-slate-400 mt-2 font-medium">Referral Rate</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
