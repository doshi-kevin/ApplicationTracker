import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST create new resume section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, name, order, latexCode, notes } = body

    if (!templateId || !name || order === undefined) {
      return NextResponse.json(
        { error: 'Template ID, section name, and order are required' },
        { status: 400 }
      )
    }

    const section = await prisma.resumeSection.create({
      data: {
        templateId,
        name,
        order,
        latexCode: latexCode || '',
        notes: notes || null,
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error: any) {
    console.error('Error creating resume section:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A section with this name already exists in this template' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create resume section' },
      { status: 500 }
    )
  }
}
