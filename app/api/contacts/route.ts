import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all contacts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const canRefer = searchParams.get('canRefer')

    const contacts = await prisma.contact.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(canRefer === 'true' && { canRefer: true }),
      },
      include: {
        company: true,
        interactions: {
          orderBy: { interactionDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            referredApplications: true,
            interactions: true,
          },
        },
      },
      orderBy: {
        lastInteractionDate: 'desc',
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      linkedinUrl,
      email,
      phone,
      companyId,
      position,
      status,
      canRefer,
      notes,
      conversationNotes,
    } = body

    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'Name and company are required' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        linkedinUrl,
        email,
        phone,
        companyId,
        position,
        status: status || 'REQUEST_SENT',
        canRefer: canRefer || false,
        notes,
        conversationNotes,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
