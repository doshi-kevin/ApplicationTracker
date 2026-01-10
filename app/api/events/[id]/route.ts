import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      outcome,
      nextSteps,
      nextStepsDueDate,
    } = body

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (applicationId !== undefined) updateData.applicationId = applicationId || null
    if (contactId !== undefined) updateData.contactId = contactId || null
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (scheduledDate !== undefined) {
      const parsedDate = new Date(scheduledDate.replace('T', 'T') + (scheduledDate.includes('Z') ? '' : 'Z'))
      updateData.scheduledDate = parsedDate
    }
    if (duration !== undefined) updateData.duration = duration || null
    if (round !== undefined) updateData.round = round || null
    if (interviewers !== undefined) updateData.interviewers = interviewers || null
    if (location !== undefined) updateData.location = location || null
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink || null
    if (status !== undefined) updateData.status = status
    if (feedback !== undefined) updateData.feedback = feedback || null
    if (notes !== undefined) updateData.notes = notes || null
    if (outcome !== undefined) updateData.outcome = outcome || null
    if (nextSteps !== undefined) updateData.nextSteps = nextSteps || null
    if (nextStepsDueDate !== undefined) {
      if (nextStepsDueDate) {
        const parsedDate = new Date(nextStepsDueDate.replace('T', 'T') + (nextStepsDueDate.includes('Z') ? '' : 'Z'))
        updateData.nextStepsDueDate = parsedDate
      } else {
        updateData.nextStepsDueDate = null
      }
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted
      updateData.completedAt = isCompleted ? new Date() : null
      if (isCompleted) {
        updateData.status = 'COMPLETED'
      }
    }

    // Check if all next steps are completed, if so, delete the event
    if (nextSteps !== undefined && nextSteps) {
      try {
        const steps = JSON.parse(nextSteps)
        const allCompleted = Array.isArray(steps) && steps.every((step: any) => step.completed === true)

        if (allCompleted && steps.length > 0) {
          // Auto-delete event when all next steps are done
          await prisma.event.delete({
            where: { id },
          })
          return NextResponse.json({ success: true, deleted: true, message: 'All next steps completed. Event auto-deleted.' })
        }
      } catch (e) {
        // If JSON parsing fails, continue normally
      }
    }

    const event = await prisma.event.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
