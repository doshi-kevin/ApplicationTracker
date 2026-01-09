import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const skillCategory = await prisma.skillCategory.update({
      where: { id },
      data: {
        name: body.name,
        skills: body.skills,
      }
    })

    return NextResponse.json(skillCategory)
  } catch (error) {
    console.error('Error updating skill category:', error)
    return NextResponse.json({ error: 'Failed to update skill category' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.skillCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting skill category:', error)
    return NextResponse.json({ error: 'Failed to delete skill category' }, { status: 500 })
  }
}
