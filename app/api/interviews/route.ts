import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all interviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const applicationId = searchParams.get('applicationId')

    const interviews = await prisma.interview.findMany({
      where: {
        ...(applicationId && { applicationId }),
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        interviewDate: 'asc',
      },
    })

    return NextResponse.json(interviews)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

// POST create new interview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      applicationId,
      round,
      title,
      interviewDate,
      duration,
      interviewers,
      location,
      meetingLink,
      status,
      feedback,
      notes,
    } = body

    if (!applicationId || !round || !title || !interviewDate) {
      return NextResponse.json(
        { error: 'Application, round, title, and date are required' },
        { status: 400 }
      )
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        round,
        title,
        interviewDate: new Date(interviewDate),
        duration,
        interviewers,
        location,
        meetingLink,
        status: status || 'SCHEDULED',
        feedback,
        notes,
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    )
  }
}
