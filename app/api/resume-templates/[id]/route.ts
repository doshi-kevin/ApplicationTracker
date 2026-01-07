import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single resume template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.resumeTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Resume template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching resume template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume template' },
      { status: 500 }
    )
  }
}

// PATCH update resume template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description } = body

    const template = await prisma.resumeTemplate.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating resume template:', error)
    return NextResponse.json(
      { error: 'Failed to update resume template' },
      { status: 500 }
    )
  }
}

// DELETE resume template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.resumeTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resume template:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume template' },
      { status: 500 }
    )
  }
}
