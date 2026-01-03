import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all applications with related data
    const applications = await prisma.application.findMany({
      include: {
        company: true,
        interviews: true,
      },
    })

    // Calculate statistics
    const totalApplications = applications.length
    const appliedCount = applications.filter(a => a.status !== 'NOT_APPLIED').length
    const interviewCount = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length
    const offerCount = applications.filter(a => a.status === 'OFFER_RECEIVED').length
    const rejectedCount = applications.filter(a => a.status === 'REJECTED').length
    const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length

    // Applications by status
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Referral success rate
    const referredApps = applications.filter(a => a.isReferred)
    const referredOffers = referredApps.filter(a => a.status === 'OFFER_RECEIVED' || a.status === 'ACCEPTED')
    const referralSuccessRate = referredApps.length > 0
      ? (referredOffers.length / referredApps.length) * 100
      : 0

    // Non-referral success rate
    const nonReferredApps = applications.filter(a => !a.isReferred)
    const nonReferredOffers = nonReferredApps.filter(a => a.status === 'OFFER_RECEIVED' || a.status === 'ACCEPTED')
    const nonReferralSuccessRate = nonReferredApps.length > 0
      ? (nonReferredOffers.length / nonReferredApps.length) * 100
      : 0

    // Average response time (days from application to interview or offer)
    const responseTimes = applications
      .filter(a => a.appliedDate && (a.status === 'INTERVIEW_SCHEDULED' || a.status === 'OFFER_RECEIVED'))
      .map(a => {
        const latestInterview = a.interviews.sort((x, y) =>
          new Date(y.interviewDate).getTime() - new Date(x.interviewDate).getTime()
        )[0]

        if (latestInterview) {
          const diff = new Date(latestInterview.interviewDate).getTime() - new Date(a.appliedDate!).getTime()
          return Math.floor(diff / (1000 * 60 * 60 * 24))
        }
        return null
      })
      .filter(t => t !== null) as number[]

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    // Applications per month
    const applicationsPerMonth = applications.reduce((acc, app) => {
      if (app.appliedDate) {
        const month = new Date(app.appliedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        })
        acc[month] = (acc[month] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Top companies
    const companyCounts = applications.reduce((acc, app) => {
      const companyName = app.company.name
      acc[companyName] = (acc[companyName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Get contacts data
    const contacts = await prisma.contact.findMany()
    const referrableContacts = contacts.filter(c => c.canRefer && c.willingToRefer).length

    return NextResponse.json({
      overview: {
        totalApplications,
        appliedCount,
        interviewCount,
        offerCount,
        rejectedCount,
        acceptedCount,
      },
      statusCounts,
      successRates: {
        referral: referralSuccessRate.toFixed(1),
        nonReferral: nonReferralSuccessRate.toFixed(1),
      },
      avgResponseTime: avgResponseTime.toFixed(1),
      applicationsPerMonth,
      topCompanies,
      referrableContacts,
      totalContacts: contacts.length,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
