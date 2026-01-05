import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      isCompleted,
      feedback,
      notes,
    } = body

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (applicationId !== undefined) updateData.applicationId = applicationId || null
    if (contactId !== undefined) updateData.contactId = contactId || null
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
    if (duration !== undefined) updateData.duration = duration || null
    if (round !== undefined) updateData.round = round || null
    if (interviewers !== undefined) updateData.interviewers = interviewers || null
    if (location !== undefined) updateData.location = location || null
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink || null
    if (status !== undefined) updateData.status = status
    if (feedback !== undefined) updateData.feedback = feedback || null
    if (notes !== undefined) updateData.notes = notes || null

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted
      updateData.completedAt = isCompleted ? new Date() : null
      if (isCompleted) {
        updateData.status = 'COMPLETED'
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
