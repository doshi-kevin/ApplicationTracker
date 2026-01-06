import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.learningItem.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching learning items:', error)
    return NextResponse.json({ error: 'Failed to fetch learning items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    } = body

    const item = await prisma.learningItem.create({
      data: {
        type: type || 'CONCEPT',
        title,
        description: description || null,
        resourceUrl: resourceUrl || null,
        additionalLinks: additionalLinks || null,
        category: category || null,
        tags: tags || null,
        status: status || 'TO_LEARN',
        priority: priority || 'MEDIUM',
        progress: progress || 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating learning item:', error)
    return NextResponse.json({ error: 'Failed to create learning item' }, { status: 500 })
  }
}
