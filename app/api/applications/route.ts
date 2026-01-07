import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all applications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const companyId = searchParams.get('companyId')

    const applications = await prisma.application.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(companyId && { companyId }),
      },
      include: {
        company: true,
        referredByContact: true,
        interviews: {
          orderBy: { interviewDate: 'asc' },
        },
        _count: {
          select: {
            interviews: true,
            reminders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')

    // Handle JSON requests (Quick Add)
    if (contentType?.includes('application/json')) {
      const body = await request.json()

      const {
        companyId,
        positionTitle,
        description,
        jobPostingUrl,
        status,
        resumePath,
        coverLetterPath,
        salaryMin,
        salaryMax,
        salaryCurrency,
        isReferred,
        referredById,
        applicationDeadline,
        notes,
      } = body

      // Validation
      if (!companyId || !positionTitle) {
        return NextResponse.json(
          { error: 'Company and position title are required' },
          { status: 400 }
        )
      }

      // Create application with string paths
      const application = await prisma.application.create({
        data: {
          companyId,
          positionTitle,
          description: description || null,
          jobPostingUrl: jobPostingUrl || null,
          status: status || 'NOT_APPLIED',
          appliedDate: status === 'APPLIED' ? new Date() : null,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          salaryCurrency: salaryCurrency || 'USD',
          resumePath: resumePath || 'Not provided',
          coverLetterPath: coverLetterPath || null,
          isReferred: isReferred || false,
          referredById: referredById || null,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          notes: notes || null,
        },
        include: {
          company: true,
          referredByContact: true,
        },
      })

      return NextResponse.json(application, { status: 201 })
    }

    // If not JSON, return error
    return NextResponse.json(
      { error: 'Invalid request format. Please use JSON.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
