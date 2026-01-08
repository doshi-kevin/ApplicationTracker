import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    let whereClause = {}
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      whereClause = {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...whereClause,
        parentTaskId: null, // Only get parent tasks
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, notes, dueDate, parentTaskId } = body

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        notes: notes || null,
        dueDate: new Date(dueDate),
        parentTaskId: parentTaskId || null,
      },
      include: {
        subtasks: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
