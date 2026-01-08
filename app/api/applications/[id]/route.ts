import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        company: true,
        referredByContact: true,
        interviews: {
          orderBy: { interviewDate: 'asc' },
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// PATCH update application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Set appliedDate if status is being changed to APPLIED
    const shouldSetAppliedDate = body.status === 'APPLIED'

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...body,
        ...(body.applicationDeadline && {
          applicationDeadline: new Date(body.applicationDeadline),
        }),
        ...(shouldSetAppliedDate && !body.appliedDate && {
          appliedDate: new Date(),
        }),
      },
      include: {
        company: true,
        referredByContact: true,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.application.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
