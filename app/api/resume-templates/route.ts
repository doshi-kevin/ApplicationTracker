import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all resume templates
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.resumeTemplate.findMany({
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching resume templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume templates' },
      { status: 500 }
    )
  }
}

// POST create new resume template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    const template = await prisma.resumeTemplate.create({
      data: {
        name,
        description: description || null,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating resume template:', error)
    return NextResponse.json(
      { error: 'Failed to create resume template' },
      { status: 500 }
    )
  }
}
