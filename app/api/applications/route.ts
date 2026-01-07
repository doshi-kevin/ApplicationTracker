import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveFile, isValidResumeFile, isValidCoverLetterFile } from '@/lib/fileUpload'

// GET all applications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const companyId = searchParams.get('companyId')

    const applications = await prisma.application.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(companyId && { companyId }),
      },
      include: {
        company: true,
        referredByContact: true,
        interviews: {
          orderBy: { interviewDate: 'asc' },
        },
        _count: {
          select: {
            interviews: true,
            reminders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')

    // Handle JSON requests (Quick Add)
    if (contentType?.includes('application/json')) {
      const body = await request.json()

      const {
        companyId,
        positionTitle,
        description,
        jobPostingUrl,
        status,
        resumePath,
        coverLetterPath,
        salaryMin,
        salaryMax,
        salaryCurrency,
        isReferred,
        referredById,
        applicationDeadline,
        notes,
      } = body

      // Validation
      if (!companyId || !positionTitle || !resumePath) {
        return NextResponse.json(
          { error: 'Company, position title, and resume path are required' },
          { status: 400 }
        )
      }

      // Create application with string paths
      const application = await prisma.application.create({
        data: {
          companyId,
          positionTitle,
          description: description || null,
          jobPostingUrl: jobPostingUrl || null,
          status: status || 'NOT_APPLIED',
          appliedDate: status === 'APPLIED' ? new Date() : null,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          salaryCurrency: salaryCurrency || 'USD',
          resumePath,
          coverLetterPath: coverLetterPath || null,
          isReferred: isReferred || false,
          referredById: referredById || null,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          notes: notes || null,
        },
        include: {
          company: true,
          referredByContact: true,
        },
      })

      return NextResponse.json(application, { status: 201 })
    }

    // Handle FormData requests (Full Form with file uploads)
    const formData = await request.formData()

    const companyId = formData.get('companyId') as string
    const positionTitle = formData.get('positionTitle') as string
    const description = formData.get('description') as string
    const jobPostingUrl = formData.get('jobPostingUrl') as string
    const status = formData.get('status') as string
    const salaryMin = formData.get('salaryMin') as string
    const salaryMax = formData.get('salaryMax') as string
    const salaryCurrency = formData.get('salaryCurrency') as string
    const isReferred = formData.get('isReferred') === 'true'
    const referredById = formData.get('referredById') as string
    const applicationDeadline = formData.get('applicationDeadline') as string
    const notes = formData.get('notes') as string
    const resume = formData.get('resume') as File
    const coverLetter = formData.get('coverLetter') as File | null

    // Validation
    if (!companyId || !positionTitle) {
      return NextResponse.json(
        { error: 'Company and position title are required' },
        { status: 400 }
      )
    }

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume is required' },
        { status: 400 }
      )
    }

    if (!isValidResumeFile(resume.name)) {
      return NextResponse.json(
        { error: 'Invalid resume file format. Allowed: PDF, DOC, DOCX' },
        { status: 400 }
      )
    }

    if (coverLetter && !isValidCoverLetterFile(coverLetter.name)) {
      return NextResponse.json(
        { error: 'Invalid cover letter file format. Allowed: PDF, DOC, DOCX, TXT' },
        { status: 400 }
      )
    }

    // Save files
    const resumePath = await saveFile(resume, 'resumes')
    const coverLetterPath = coverLetter
      ? await saveFile(coverLetter, 'cover-letters')
      : null

    // Create application
    const application = await prisma.application.create({
      data: {
        companyId,
        positionTitle,
        description: description || null,
        jobPostingUrl: jobPostingUrl || null,
        status: status as any || 'APPLIED',
        appliedDate: new Date(),
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'USD',
        resumePath,
        coverLetterPath,
        isReferred,
        referredById: referredById || null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        notes: notes || null,
      },
      include: {
        company: true,
        referredByContact: true,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
