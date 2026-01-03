import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all reminders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isCompleted = searchParams.get('isCompleted')

    const reminders = await prisma.reminder.findMany({
      where: {
        ...(isCompleted !== null && {
          isCompleted: isCompleted === 'true',
        }),
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

// POST create new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      applicationId,
      title,
      description,
      dueDate,
      type,
    } = body

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      )
    }

    const reminder = await prisma.reminder.create({
      data: {
        applicationId: applicationId || null,
        title,
        description,
        dueDate: new Date(dueDate),
        type: type || 'FOLLOW_UP',
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}
