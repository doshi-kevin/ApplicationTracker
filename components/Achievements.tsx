'use client'

import { motion } from 'framer-motion'
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Flame,
  Rocket,
  Medal,
  CheckCircle2,
  Lock
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

interface AchievementsProps {
  applications: any[]
  contacts: any[]
  compact?: boolean
}

export default function Achievements({ applications, contacts, compact = false }: AchievementsProps) {
  const calculateAchievements = (): Achievement[] => {
    const appliedCount = applications.filter(app => app.status !== 'wishlist').length
    const interviewCount = applications.filter(app => ['interview', 'offer', 'accepted'].includes(app.status)).length
    const offerCount = applications.filter(app => ['offer', 'accepted'].includes(app.status)).length
    const withReferral = applications.filter(app => app.hasReferral).length

    return [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Submit your first job application',
        icon: <Star className="w-6 h-6" />,
        unlocked: appliedCount >= 1,
        progress: Math.min(appliedCount, 1),
        maxProgress: 1,
        rarity: 'common',
        unlockedAt: appliedCount >= 1 ? new Date().toISOString() : undefined,
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Apply to 5 positions',
        icon: <Target className="w-6 h-6" />,
        unlocked: appliedCount >= 5,
        progress: Math.min(appliedCount, 5),
        maxProgress: 5,
        rarity: 'common',
      },
      {
        id: 'job-hunter',
        title: 'Job Hunter',
        description: 'Apply to 10 positions',
        icon: <Zap className="w-6 h-6" />,
        unlocked: appliedCount >= 10,
        progress: Math.min(appliedCount, 10),
        maxProgress: 10,
        rarity: 'common',
      },
      {
        id: 'persistent',
        title: 'Persistent',
        description: 'Apply to 25 positions',
        icon: <Flame className="w-6 h-6" />,
        unlocked: appliedCount >= 25,
        progress: Math.min(appliedCount, 25),
        maxProgress: 25,
        rarity: 'rare',
      },
      {
        id: 'unstoppable',
        title: 'Unstoppable',
        description: 'Apply to 50 positions',
        icon: <Rocket className="w-6 h-6" />,
        unlocked: appliedCount >= 50,
        progress: Math.min(appliedCount, 50),
        maxProgress: 50,
        rarity: 'epic',
      },
      {
        id: 'job-search-legend',
        title: 'Job Search Legend',
        description: 'Apply to 100 positions',
        icon: <Crown className="w-6 h-6" />,
        unlocked: appliedCount >= 100,
        progress: Math.min(appliedCount, 100),
        maxProgress: 100,
        rarity: 'legendary',
      },
      {
        id: 'networker',
        title: 'Networker',
        description: 'Add 10 professional contacts',
        icon: <Award className="w-6 h-6" />,
        unlocked: contacts.length >= 10,
        progress: Math.min(contacts.length, 10),
        maxProgress: 10,
        rarity: 'rare',
      },
      {
        id: 'referral-master',
        title: 'Referral Master',
        description: 'Get 5 referrals',
        icon: <Medal className="w-6 h-6" />,
        unlocked: withReferral >= 5,
        progress: Math.min(withReferral, 5),
        maxProgress: 5,
        rarity: 'rare',
      },
      {
        id: 'interview-ready',
        title: 'Interview Ready',
        description: 'Secure your first interview',
        icon: <CheckCircle2 className="w-6 h-6" />,
        unlocked: interviewCount >= 1,
        progress: Math.min(interviewCount, 1),
        maxProgress: 1,
        rarity: 'rare',
      },
      {
        id: 'interview-pro',
        title: 'Interview Pro',
        description: 'Get 5 interview invitations',
        icon: <Trophy className="w-6 h-6" />,
        unlocked: interviewCount >= 5,
        progress: Math.min(interviewCount, 5),
        maxProgress: 5,
        rarity: 'epic',
      },
      {
        id: 'offer-received',
        title: 'Offer Received',
        description: 'Receive your first job offer',
        icon: <Award className="w-6 h-6" />,
        unlocked: offerCount >= 1,
        progress: Math.min(offerCount, 1),
        maxProgress: 1,
        rarity: 'epic',
      },
      {
        id: 'multiple-offers',
        title: 'In Demand',
        description: 'Receive 3 job offers',
        icon: <Crown className="w-6 h-6" />,
        unlocked: offerCount >= 3,
        progress: Math.min(offerCount, 3),
        maxProgress: 3,
        rarity: 'legendary',
      },
    ]
  }

  const achievements = calculateAchievements()
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  const getRarityStyle = (rarity: string, unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: 'from-slate-600/10 to-slate-600/10',
        border: 'border-slate-500/20',
        icon: 'bg-slate-500/10 text-slate-600',
        glow: '',
      }
    }

    switch (rarity) {
      case 'common':
        return {
          bg: 'from-blue-600/10 to-cyan-600/10',
          border: 'border-blue-500/30',
          icon: 'bg-blue-500/20 text-blue-400',
          glow: 'shadow-blue-500/20',
        }
      case 'rare':
        return {
          bg: 'from-purple-600/10 to-pink-600/10',
          border: 'border-purple-500/30',
          icon: 'bg-purple-500/20 text-purple-400',
          glow: 'shadow-purple-500/20',
        }
      case 'epic':
        return {
          bg: 'from-amber-600/10 to-orange-600/10',
          border: 'border-amber-500/30',
          icon: 'bg-amber-500/20 text-amber-400',
          glow: 'shadow-amber-500/20',
        }
      case 'legendary':
        return {
          bg: 'from-emerald-600/10 via-yellow-600/10 to-pink-600/10',
          border: 'border-yellow-500/30',
          icon: 'bg-gradient-to-r from-yellow-500/20 to-pink-500/20 text-yellow-400',
          glow: 'shadow-yellow-500/30 shadow-lg',
        }
      default:
        return {
          bg: 'from-slate-600/10 to-slate-600/10',
          border: 'border-slate-500/30',
          icon: 'bg-slate-500/20 text-slate-400',
          glow: '',
        }
    }
  }

  const displayAchievements = compact
    ? achievements.filter(a => a.unlocked).slice(0, 3)
    : achievements

  return (
    <div>
      {/* Header Stats */}
      <div className="mb-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Achievement Progress</p>
              <p className="text-sm text-slate-400">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-400">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </p>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {displayAchievements.map((achievement, index) => {
          const style = getRarityStyle(achievement.rarity, achievement.unlocked)

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl p-4 backdrop-blur-xl ${style.glow} ${achievement.unlocked ? 'hover:scale-[1.02]' : 'opacity-60'} transition-all`}
            >
              {/* Rarity Badge */}
              {achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg ${
                    achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500/20 to-pink-500/20 text-yellow-400 border border-yellow-500/30' :
                    achievement.rarity === 'epic' ? 'bg-amber-500/20 text-amber-400' :
                    achievement.rarity === 'rare' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${style.icon} rounded-xl flex items-center justify-center flex-shrink-0 relative`}>
                  {achievement.unlocked ? (
                    achievement.icon
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                  {achievement.unlocked && achievement.rarity === 'legendary' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-yellow-500/20 rounded-xl blur-sm"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-2 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                      <p className="text-xs text-slate-600">
                        {achievement.progress} / {achievement.maxProgress}
                      </p>
                    </>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Unlocked!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
