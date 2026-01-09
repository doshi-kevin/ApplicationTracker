import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')

    const where = resumeId ? { resumeId } : {}

    const education = await prisma.education.findMany({
      where,
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(education)
  } catch (error) {
    console.error('Error fetching education:', error)
    return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const education = await prisma.education.create({
      data: {
        resumeId: body.resumeId,
        school: body.school,
        degree: body.degree,
        field: body.field,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        gpa: body.gpa,
        achievements: body.achievements,
        order: body.order || 0
      }
    })
    return NextResponse.json(education, { status: 201 })
  } catch (error) {
    console.error('Error creating education:', error)
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
  }
}
