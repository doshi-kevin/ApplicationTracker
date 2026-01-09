import { NextResponse} from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const education = await prisma.education.update({
      where: { id },
      data: {
        school: body.school,
        degree: body.degree,
        field: body.field,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        gpa: body.gpa,
        achievements: body.achievements,
      }
    })

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error updating education:', error)
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.education.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting education:', error)
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 })
  }
}
