import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        experiences: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        education: { orderBy: { order: 'asc' } }
      }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        targetRole: body.targetRole,
        isDefault: body.isDefault,
        lastUsedAt: body.lastUsedAt ? new Date(body.lastUsedAt) : undefined
      },
      include: {
        experiences: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        education: { orderBy: { order: 'asc' } }
      }
    })

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Error updating resume:', error)
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.resume.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}
