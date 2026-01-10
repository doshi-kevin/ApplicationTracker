import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Convert datetime-local string to UTC Date object
// datetime-local format: "2024-01-15T17:00:00"
// This function creates a UTC date that represents the same local time
function parseLocalDateTime(dateTimeString: string): Date {
  // Parse the date string components
  const date = new Date(dateTimeString)

  // Get the timezone offset in minutes
  const offsetMinutes = date.getTimezoneOffset()

  // Adjust by adding the offset to counteract the automatic UTC conversion
  // This makes the UTC time equal to what the user entered
  const adjustedDate = new Date(date.getTime() - (offsetMinutes * 60 * 1000))

  return adjustedDate
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        application: {
          include: {
            company: true,
          },
        },
        contact: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,
      applicationId,
      contactId,
      title,
      description,
      scheduledDate,
      duration,
      round,
      interviewers,
      location,
      meetingLink,
      status,
      notes,
    } = body

    const event = await prisma.event.create({
      data: {
        type: type || 'REMINDER',
        applicationId: applicationId || null,
        contactId: contactId || null,
        title,
        description: description || null,
        scheduledDate: parseLocalDateTime(scheduledDate),
        duration: duration || null,
        round: round || null,
        interviewers: interviewers || null,
        location: location || null,
        meetingLink: meetingLink || null,
        status: status || 'PENDING',
        notes: notes || null,
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
        contact: {
          include: {
            company: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
