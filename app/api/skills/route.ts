import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')

    const where = resumeId ? { resumeId } : {}

    const skills = await prisma.skillCategory.findMany({
      where,
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const skillCategory = await prisma.skillCategory.create({
      data: {
        resumeId: body.resumeId,
        name: body.name,
        skills: body.skills,
        order: body.order || 0
      }
    })
    return NextResponse.json(skillCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating skill category:', error)
    return NextResponse.json({ error: 'Failed to create skill category' }, { status: 500 })
  }
}
