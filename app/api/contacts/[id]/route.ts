import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        interactions: {
          orderBy: { interactionDate: 'desc' },
        },
        referredApplications: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

// PATCH update contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Set messagedDate if status is being changed to MESSAGED, REPLIED, or MEETING_SCHEDULED
    const shouldSetMessagedDate =
      body.status &&
      ['MESSAGED', 'REPLIED', 'MEETING_SCHEDULED'].includes(body.status)

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...body,
        ...(body.lastInteractionDate && {
          lastInteractionDate: new Date(body.lastInteractionDate),
        }),
        ...(shouldSetMessagedDate && !body.messagedDate && {
          messagedDate: new Date(),
        }),
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

// DELETE contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.contact.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
