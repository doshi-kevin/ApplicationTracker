'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Companies', href: '/companies', icon: '🏢' },
  { name: 'Applications', href: '/applications', icon: '📝' },
  { name: 'Contacts', href: '/contacts', icon: '👥' },
  { name: 'Events', href: '/events', icon: '📅' },
  { name: 'Reminders', href: '/reminders', icon: '⚡' },
  { name: 'Resumes', href: '/resumes', icon: '📄' },
  { name: 'Learning', href: '/learning', icon: '🎓' },
  { name: 'Email Templates', href: '/email-templates', icon: '✉️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors z-10 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="p-6">
        {!isCollapsed ? (
          <>
            <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
            <p className="text-sm text-gray-400 mt-1">Your career companion</p>
          </>
        ) : (
          <div className="text-2xl text-center">📋</div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }
              `}
              title={isCollapsed ? item.name : ''}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="text-xs text-gray-500">
            <p>Job Application Tracker</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  )
}
