import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH update resume section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, order, latexCode, notes } = body

    const section = await prisma.resumeSection.update({
      where: { id },
      data: {
        name: name || undefined,
        order: order !== undefined ? order : undefined,
        latexCode: latexCode !== undefined ? latexCode : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating resume section:', error)
    return NextResponse.json(
      { error: 'Failed to update resume section' },
      { status: 500 }
    )
  }
}

// DELETE resume section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.resumeSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resume section:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume section' },
      { status: 500 }
    )
  }
}
