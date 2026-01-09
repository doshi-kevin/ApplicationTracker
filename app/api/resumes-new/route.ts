import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      include: {
        experiences: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        education: { orderBy: { order: 'asc' } }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const resume = await prisma.resume.create({
      data: {
        name: body.name,
        description: body.description,
        targetRole: body.targetRole,
        isDefault: body.isDefault || false
      },
      include: {
        experiences: true,
        projects: true,
        skills: true,
        education: true
      }
    })
    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 })
  }
}
