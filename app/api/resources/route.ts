import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        subResources: {
          orderBy: { createdAt: 'asc' }
        },
        parent: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const resource = await prisma.resource.create({
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        type: body.type,
        category: body.category,
        tags: body.tags,
        parentId: body.parentId || null,
        isCompleted: body.isCompleted || false,
        isFavorite: body.isFavorite || false,
        notes: body.notes
      },
      include: {
        subResources: true,
        parent: true
      }
    })
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 })
  }
}
