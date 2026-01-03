'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Applications', href: '/applications', icon: '📝' },
  { name: 'Contacts', href: '/contacts', icon: '👥' },
  { name: 'Referrals', href: '/referrals', icon: '🎯' },
  { name: 'Interviews', href: '/interviews', icon: '💼' },
  { name: 'Reminders', href: '/reminders', icon: '⏰' },
  { name: 'Email Templates', href: '/email-templates', icon: '✉️' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">Your career companion</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="text-xs text-gray-500">
          <p>Job Application Tracker</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
