'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Analytics {
  overview: {
    totalApplications: number
    appliedCount: number
    interviewCount: number
    offerCount: number
    rejectedCount: number
  }
  successRates: {
    referral: number
    nonReferral: number
  }
  avgResponseTime: number
  referrableContacts: number
}

export default function Dashboard() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-slate-400 text-lg font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Loading dashboard...
        </motion.div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Applications',
      value: analytics?.overview?.totalApplications || 0,
      icon: Briefcase,
      gradient: 'from-blue-500 to-blue-700',
      textColor: 'text-blue-300'
    },
    {
      name: 'Interviews',
      value: analytics?.overview?.interviewCount || 0,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-700',
      textColor: 'text-purple-300'
    },
    {
      name: 'Offers',
      value: analytics?.overview?.offerCount || 0,
      icon: Award,
      gradient: 'from-emerald-500 to-emerald-700',
      textColor: 'text-emerald-300'
    },
    {
      name: 'Referrable Contacts',
      value: analytics?.referrableContacts || 0,
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-300'
    },
  ]

  const quickActions = [
    {
      title: 'Add Application',
      description: 'Track a new job application',
      href: '/applications',
      icon: Plus,
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      title: 'Add Contact',
      description: 'Save a new networking contact',
      href: '/contacts',
      icon: Users,
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      title: 'Schedule Interview',
      description: 'Add an upcoming interview',
      href: '/interviews',
      icon: Calendar,
      gradient: 'from-purple-600 to-pink-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent flex items-center gap-4 mb-3"
          >
            <Sparkles className="w-10 h-10 text-blue-400" />
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Welcome back! Here's your job search overview
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", stat.gradient)}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-slate-400 text-sm mb-2">{stat.name}</p>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Success Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              {quickActions.map((action, i) => (
                <Link
                  key={action.title}
                  href={action.href}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="group/action bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", action.gradient)}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                          <p className="text-slate-400 text-sm">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover/action:text-white group-hover/action:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Success Rates */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Success Rates</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">With Referral</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {analytics?.successRates?.referral || 0}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics?.successRates?.referral || 0}%` }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">Without Referral</span>
                  <span className="text-blue-400 font-bold text-lg">
                    {analytics?.successRates?.nonReferral || 0}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics?.successRates?.nonReferral || 0}%` }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Avg Response Time</p>
                    <p className="text-3xl font-bold text-white">
                      {analytics?.avgResponseTime || 0} <span className="text-lg text-slate-400">days</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Application Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Application Status</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-4xl font-bold text-white mb-2">
                {analytics?.overview?.appliedCount || 0}
              </p>
              <p className="text-sm text-slate-400">Applied</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-4xl font-bold text-purple-400 mb-2">
                {analytics?.overview?.interviewCount || 0}
              </p>
              <p className="text-sm text-slate-400">Interviews</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-4xl font-bold text-emerald-400 mb-2">
                {analytics?.overview?.offerCount || 0}
              </p>
              <p className="text-sm text-slate-400">Offers</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-4xl font-bold text-red-400 mb-2">
                {analytics?.overview?.rejectedCount || 0}
              </p>
              <p className="text-sm text-slate-400">Rejected</p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
