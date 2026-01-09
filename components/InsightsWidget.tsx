'use client'

import { motion } from 'framer-motion'
import {
  Lightbulb,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle2,
  Zap,
  Calendar,
  Users,
  Star,
  ArrowRight
} from 'lucide-react'

interface Insight {
  id: string
  type: 'success' | 'warning' | 'tip' | 'achievement'
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface InsightsWidgetProps {
  applications?: any[]
  contacts?: any[]
  compact?: boolean
}

export default function InsightsWidget({
  applications = [],
  contacts = [],
  compact = false
}: InsightsWidgetProps) {

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Application volume insight
    const recentApps = applications.filter(app => {
      const appliedDate = new Date(app.appliedDate || app.createdAt)
      const daysSince = (Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7
    })

    if (recentApps.length >= 5) {
      insights.push({
        id: 'high-activity',
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Strong Application Activity!',
        description: `You've applied to ${recentApps.length} positions this week. Keep up the momentum!`,
      })
    } else if (recentApps.length === 0 && applications.length > 0) {
      insights.push({
        id: 'low-activity',
        type: 'warning',
        icon: <AlertCircle className="w-5 h-5" />,
        title: 'No Recent Applications',
        description: 'You haven\'t applied to any positions this week. Set a goal to apply to at least 3 jobs!',
        action: {
          label: 'Browse Companies',
          href: '/companies'
        }
      })
    }

    // Interview conversion rate
    const appliedCount = applications.filter(app => app.status !== 'wishlist').length
    const interviewCount = applications.filter(app =>
      app.status === 'interview' || app.status === 'offer' || app.status === 'accepted'
    ).length

    if (appliedCount >= 10) {
      const conversionRate = (interviewCount / appliedCount) * 100
      if (conversionRate > 20) {
        insights.push({
          id: 'high-conversion',
          type: 'achievement',
          icon: <Star className="w-5 h-5" />,
          title: 'Excellent Interview Rate!',
          description: `Your ${conversionRate.toFixed(0)}% interview rate is well above average. Your applications are getting noticed!`,
        })
      } else if (conversionRate < 5) {
        insights.push({
          id: 'low-conversion',
          type: 'tip',
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Improve Your Application Quality',
          description: 'Try tailoring each resume and cover letter to the specific role. Research shows personalized applications get 3x more responses.',
          action: {
            label: 'View Resume Tips',
            href: '/resumes'
          }
        })
      }
    }

    // Referral usage
    const withReferral = applications.filter(app => app.hasReferral).length
    const referralRate = appliedCount > 0 ? (withReferral / appliedCount) * 100 : 0

    if (referralRate < 20 && contacts.length > 5) {
      insights.push({
        id: 'use-network',
        type: 'tip',
        icon: <Users className="w-5 h-5" />,
        title: 'Leverage Your Network',
        description: `You have ${contacts.length} contacts but only ${referralRate.toFixed(0)}% of applications use referrals. Reach out to your network!`,
        action: {
          label: 'View Contacts',
          href: '/contacts'
        }
      })
    }

    // Response time tracking
    const pendingApps = applications.filter(app =>
      app.status === 'applied' && app.appliedDate
    )

    if (pendingApps.length > 0) {
      const oldestPending = pendingApps.reduce((oldest, app) => {
        const appDate = new Date(app.appliedDate)
        const oldestDate = new Date(oldest.appliedDate)
        return appDate < oldestDate ? app : oldest
      })

      const daysSince = Math.floor((Date.now() - new Date(oldestPending.appliedDate).getTime()) / (1000 * 60 * 60 * 24))

      if (daysSince > 14) {
        insights.push({
          id: 'follow-up',
          type: 'tip',
          icon: <Calendar className="w-5 h-5" />,
          title: 'Time to Follow Up?',
          description: `Your application to ${oldestPending.company?.name || 'a company'} is ${daysSince} days old. Consider sending a polite follow-up email.`,
          action: {
            label: 'View Application',
            href: '/applications'
          }
        })
      }
    }

    // Upcoming interviews
    const upcomingInterviews = applications.filter(app => {
      if (app.status !== 'interview') return false
      // This would check for interview dates in the future
      return true
    })

    if (upcomingInterviews.length > 0) {
      insights.push({
        id: 'prep-interviews',
        type: 'success',
        icon: <Target className="w-5 h-5" />,
        title: `${upcomingInterviews.length} Interview${upcomingInterviews.length > 1 ? 's' : ''} Scheduled!`,
        description: 'Make sure to research the company, practice common questions, and prepare thoughtful questions to ask.',
        action: {
          label: 'Prep Resources',
          href: '/learning'
        }
      })
    }

    // Milestone achievements
    if (applications.length === 10) {
      insights.push({
        id: 'milestone-10',
        type: 'achievement',
        icon: <Zap className="w-5 h-5" />,
        title: '10 Applications Milestone!',
        description: 'Great job staying consistent with your job search. Keep building momentum!',
      })
    } else if (applications.length === 50) {
      insights.push({
        id: 'milestone-50',
        type: 'achievement',
        icon: <Star className="w-5 h-5" />,
        title: '50 Applications - Incredible Effort!',
        description: 'Your persistence is admirable. Success is just around the corner!',
      })
    }

    // First offer
    const offers = applications.filter(app => app.status === 'offer' || app.status === 'accepted')
    if (offers.length === 1) {
      insights.push({
        id: 'first-offer',
        type: 'achievement',
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: 'Your First Offer! 🎉',
        description: 'Congratulations on receiving your first job offer! All your hard work is paying off.',
      })
    }

    return insights.slice(0, compact ? 2 : 4)
  }

  const insights = generateInsights()

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-emerald-600/10 to-green-600/10',
          border: 'border-emerald-500/30',
          icon: 'bg-emerald-500/20 text-emerald-400',
        }
      case 'warning':
        return {
          bg: 'from-amber-600/10 to-orange-600/10',
          border: 'border-amber-500/30',
          icon: 'bg-amber-500/20 text-amber-400',
        }
      case 'tip':
        return {
          bg: 'from-blue-600/10 to-cyan-600/10',
          border: 'border-blue-500/30',
          icon: 'bg-blue-500/20 text-blue-400',
        }
      case 'achievement':
        return {
          bg: 'from-purple-600/10 to-pink-600/10',
          border: 'border-purple-500/30',
          icon: 'bg-purple-500/20 text-purple-400',
        }
      default:
        return {
          bg: 'from-slate-600/10 to-slate-600/10',
          border: 'border-slate-500/30',
          icon: 'bg-slate-500/20 text-slate-400',
        }
    }
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-white/5 border border-white/10 rounded-2xl">
        <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Keep tracking your applications to get personalized insights!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => {
        const style = getInsightStyle(insight.type)

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${style.bg} border ${style.border} rounded-xl p-4 backdrop-blur-xl`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${style.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{insight.description}</p>
                {insight.action && (
                  <a
                    href={insight.action.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {insight.action.label}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
