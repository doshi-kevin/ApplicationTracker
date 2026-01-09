import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        type: body.type,
        category: body.category,
        tags: body.tags,
        parentId: body.parentId,
        isCompleted: body.isCompleted,
        isFavorite: body.isFavorite,
        notes: body.notes
      },
      include: {
        subResources: true,
        parent: true
      }
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.resource.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
