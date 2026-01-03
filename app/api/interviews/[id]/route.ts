import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH update interview
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...body,
        ...(body.interviewDate && {
          interviewDate: new Date(body.interviewDate),
        }),
      },
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
    })

    return NextResponse.json(interview)
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    )
  }
}

// DELETE interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.interview.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Interview deleted successfully' })
  } catch (error) {
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    )
  }
}
