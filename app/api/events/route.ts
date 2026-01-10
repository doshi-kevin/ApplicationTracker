import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Parse datetime-local input (format: "2024-01-15T17:00")
    // and create a Date object that preserves the local time
    const parsedDate = new Date(scheduledDate.replace('T', 'T') + (scheduledDate.includes('Z') ? '' : 'Z'))

    const event = await prisma.event.create({
      data: {
        type: type || 'REMINDER',
        applicationId: applicationId || null,
        contactId: contactId || null,
        title,
        description: description || null,
        scheduledDate: parsedDate,
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
