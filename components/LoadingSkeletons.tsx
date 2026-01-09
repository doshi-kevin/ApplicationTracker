'use client'

import { motion } from 'framer-motion'

export function CardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-white/10 rounded-lg w-1/2" />
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded-lg w-full" />
        <div className="h-4 bg-white/10 rounded-lg w-5/6" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex gap-4">
        <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-white/5 p-4 flex gap-4 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}

export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-white/10 rounded-lg w-1/3" />
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
      </div>
      <div className="h-8 bg-white/10 rounded-lg w-1/2 mb-2" />
      <div className="h-3 bg-white/10 rounded-lg w-2/3" />
    </div>
  )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3 bg-white/10 rounded-lg w-1/2" />
          </div>
          <div className="w-20 h-8 bg-white/10 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 bg-white/10 rounded-lg w-2/3 mb-3" />
          <div className="h-4 bg-white/10 rounded-lg w-1/2 mb-2" />
          <div className="h-4 bg-white/10 rounded-lg w-1/3" />
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-10 bg-white/10 rounded-xl" />
          <div className="w-24 h-10 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-6 bg-white/10 rounded-lg w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded-lg w-full" />
            <div className="h-4 bg-white/10 rounded-lg w-5/6" />
            <div className="h-4 bg-white/10 rounded-lg w-4/6" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-white/10 rounded-lg w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded-lg w-full" />
            <div className="h-4 bg-white/10 rounded-lg w-5/6" />
            <div className="h-4 bg-white/10 rounded-lg w-4/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8">
      {/* Stats Grid */}
      <div>
        <div className="h-8 bg-white/10 rounded-lg w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="h-8 bg-white/10 rounded-lg w-48 mb-6 animate-pulse" />
        <ListSkeleton items={3} />
      </div>
    </div>
  )
}

// Shimmer effect skeleton (more modern)
export function ShimmerCard() {
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
      <div className="space-y-4">
        <div className="h-6 bg-white/10 rounded-lg w-3/4" />
        <div className="h-4 bg-white/10 rounded-lg w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded-lg w-full" />
          <div className="h-4 bg-white/10 rounded-lg w-5/6" />
        </div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </motion.div>
    </div>
  )
}

export function PulseDot() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-4 h-4 bg-blue-500 rounded-full opacity-30"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
