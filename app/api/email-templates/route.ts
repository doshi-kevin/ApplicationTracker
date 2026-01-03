import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all email templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const templates = await prisma.emailTemplate.findMany({
      where: {
        ...(category && { category: category as any }),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

// POST create new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, body: emailBody, category } = body

    if (!name || !subject || !emailBody || !category) {
      return NextResponse.json(
        { error: 'Name, subject, body, and category are required' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: emailBody,
        category,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    )
  }
}
