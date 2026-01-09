import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')

    const where = resumeId ? { resumeId } : {}

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await prisma.project.create({
      data: {
        resumeId: body.resumeId,
        name: body.name,
        description: body.description,
        technologies: body.technologies,
        githubUrl: body.githubUrl,
        liveUrl: body.liveUrl,
        startDate: body.startDate,
        endDate: body.endDate,
        bulletPoints: body.bulletPoints,
        order: body.order || 0
      }
    })
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
