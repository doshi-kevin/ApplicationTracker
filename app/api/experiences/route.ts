import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')

    const where = resumeId ? { resumeId } : {}

    const experiences = await prisma.experience.findMany({
      where,
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(experiences)
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const experience = await prisma.experience.create({
      data: {
        resumeId: body.resumeId,
        company: body.company,
        position: body.position,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        bulletPoints: body.bulletPoints,
        order: body.order || 0
      }
    })
    return NextResponse.json(experience, { status: 201 })
  } catch (error) {
    console.error('Error creating experience:', error)
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 })
  }
}
