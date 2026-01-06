import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.learningItem.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching learning item:', error)
    return NextResponse.json({ error: 'Failed to fetch learning item' }, { status: 500 })
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
      title,
      description,
      resourceUrl,
      additionalLinks,
      category,
      tags,
      status,
      priority,
      progress,
      targetDate,
      notes,
      keyTakeaways,
    } = body

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (resourceUrl !== undefined) updateData.resourceUrl = resourceUrl || null
    if (additionalLinks !== undefined) updateData.additionalLinks = additionalLinks || null
    if (category !== undefined) updateData.category = category || null
    if (tags !== undefined) updateData.tags = tags || null
    if (priority !== undefined) updateData.priority = priority
    if (progress !== undefined) updateData.progress = progress
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null
    if (notes !== undefined) updateData.notes = notes || null
    if (keyTakeaways !== undefined) updateData.keyTakeaways = keyTakeaways || null

    // Handle status changes with timestamps
    if (status !== undefined) {
      updateData.status = status

      if (status === 'IN_PROGRESS' && !body.startedAt) {
        updateData.startedAt = new Date()
      }

      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
        updateData.progress = 100
      }
    }

    const item = await prisma.learningItem.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating learning item:', error)
    return NextResponse.json({ error: 'Failed to update learning item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.learningItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting learning item:', error)
    return NextResponse.json({ error: 'Failed to delete learning item' }, { status: 500 })
  }
}
