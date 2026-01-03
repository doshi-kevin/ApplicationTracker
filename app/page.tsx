import Link from 'next/link'

async function getDashboardData() {
  try {
    const response = await fetch('http://localhost:3000/api/analytics', {
      cache: 'no-store',
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function Dashboard() {
  const analytics = await getDashboardData()

  const stats = [
    {
      name: 'Total Applications',
      value: analytics?.overview?.totalApplications || 0,
      icon: '📝',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      name: 'In Review',
      value: analytics?.overview?.interviewCount || 0,
      icon: '💼',
      color: 'bg-yellow-500/10 text-yellow-400',
    },
    {
      name: 'Offers Received',
      value: analytics?.overview?.offerCount || 0,
      icon: '🎉',
      color: 'bg-green-500/10 text-green-400',
    },
    {
      name: 'Referrable Contacts',
      value: analytics?.referrableContacts || 0,
      icon: '🎯',
      color: 'bg-purple-500/10 text-purple-400',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Here&apos;s your job search overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`text-4xl ${stat.color} p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/applications?new=true"
              className="block w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-3 rounded-lg transition-colors text-center font-medium"
            >
              + Add New Application
            </Link>
            <Link
              href="/contacts?new=true"
              className="block w-full bg-[#252525] hover:bg-[#2f2f2f] text-white px-4 py-3 rounded-lg transition-colors text-center font-medium"
            >
              + Add Contact
            </Link>
            <Link
              href="/interviews?new=true"
              className="block w-full bg-[#252525] hover:bg-[#2f2f2f] text-white px-4 py-3 rounded-lg transition-colors text-center font-medium"
            >
              + Schedule Interview
            </Link>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white mb-4">
            Success Rates
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">With Referral</span>
                <span className="text-green-400 font-semibold">
                  {analytics?.successRates?.referral || 0}%
                </span>
              </div>
              <div className="w-full bg-[#252525] rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${analytics?.successRates?.referral || 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Without Referral</span>
                <span className="text-blue-400 font-semibold">
                  {analytics?.successRates?.nonReferral || 0}%
                </span>
              </div>
              <div className="w-full bg-[#252525] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${analytics?.successRates?.nonReferral || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-[#2a2a2a]">
              <p className="text-sm text-gray-400">
                Average Response Time
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics?.avgResponseTime || 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
        <h2 className="text-xl font-semibold text-white mb-4">
          Application Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {analytics?.overview?.appliedCount || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Applied</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {analytics?.overview?.interviewCount || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Interviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {analytics?.overview?.offerCount || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Offers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {analytics?.overview?.rejectedCount || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  )
}
