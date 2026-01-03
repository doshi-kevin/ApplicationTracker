const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create companies
  const google = await prisma.company.create({
    data: {
      name: 'Google',
      website: 'https://google.com',
      careersUrl: 'https://careers.google.com',
      notes: 'Great company culture and benefits',
    },
  })

  const microsoft = await prisma.company.create({
    data: {
      name: 'Microsoft',
      website: 'https://microsoft.com',
      careersUrl: 'https://careers.microsoft.com',
      notes: 'Excellent work-life balance',
    },
  })

  const meta = await prisma.company.create({
    data: {
      name: 'Meta',
      website: 'https://meta.com',
      careersUrl: 'https://careers.meta.com',
    },
  })

  console.log('✅ Created 3 companies')

  // Create contacts
  const contact1 = await prisma.contact.create({
    data: {
      name: 'John Smith',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      email: 'john@google.com',
      companyId: google.id,
      position: 'Senior Software Engineer',
      status: 'CONNECTED',
      canRefer: true,
      willingToRefer: true,
      lastInteractionDate: new Date(),
    },
  })

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Sarah Johnson',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      companyId: microsoft.id,
      position: 'Engineering Manager',
      status: 'MESSAGED',
      canRefer: true,
      willingToRefer: false,
    },
  })

  console.log('✅ Created 2 contacts')

  // Create applications
  const app1 = await prisma.application.create({
    data: {
      companyId: google.id,
      positionTitle: 'Software Engineer',
      description: 'Full-stack development position',
      jobPostingUrl: 'https://careers.google.com/jobs/123',
      status: 'APPLIED',
      appliedDate: new Date('2024-01-15'),
      salaryMin: 150000,
      salaryMax: 200000,
      resumePath: '/uploads/resumes/resume1.pdf',
      isReferred: true,
      referredById: contact1.id,
    },
  })

  const app2 = await prisma.application.create({
    data: {
      companyId: microsoft.id,
      positionTitle: 'Senior Software Engineer',
      jobPostingUrl: 'https://careers.microsoft.com/jobs/456',
      status: 'INTERVIEW_SCHEDULED',
      appliedDate: new Date('2024-01-20'),
      salaryMin: 160000,
      salaryMax: 210000,
      resumePath: '/uploads/resumes/resume2.pdf',
      isReferred: false,
    },
  })

  const app3 = await prisma.application.create({
    data: {
      companyId: meta.id,
      positionTitle: 'Frontend Engineer',
      status: 'IN_REVIEW',
      appliedDate: new Date('2024-01-25'),
      salaryMin: 155000,
      salaryMax: 205000,
      resumePath: '/uploads/resumes/resume3.pdf',
    },
  })

  console.log('✅ Created 3 applications')

  // Create interviews
  await prisma.interview.create({
    data: {
      applicationId: app2.id,
      round: 1,
      title: 'Phone Screen',
      interviewDate: new Date('2024-02-01'),
      duration: 45,
      location: 'Phone',
      status: 'COMPLETED',
      feedback: 'Went well, moving to next round',
    },
  })

  await prisma.interview.create({
    data: {
      applicationId: app2.id,
      round: 2,
      title: 'Technical Interview',
      interviewDate: new Date('2024-02-10'),
      duration: 90,
      location: 'Zoom',
      meetingLink: 'https://zoom.us/j/123456',
      status: 'SCHEDULED',
    },
  })

  console.log('✅ Created 2 interviews')

  // Create reminders
  await prisma.reminder.create({
    data: {
      applicationId: app1.id,
      title: 'Follow up with Google',
      description: 'Check on application status',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      type: 'FOLLOW_UP',
    },
  })

  await prisma.reminder.create({
    data: {
      applicationId: app2.id,
      title: 'Prepare for Microsoft interview',
      description: 'Review system design concepts',
      dueDate: new Date('2024-02-09'),
      type: 'INTERVIEW_PREP',
    },
  })

  console.log('✅ Created 2 reminders')

  // Create email template
  await prisma.emailTemplate.create({
    data: {
      name: 'Connection Request',
      subject: 'Connecting to discuss opportunities at {company}',
      body: `Hi {name},

I came across your profile and noticed you work at {company}. I'm very interested in opportunities there, particularly in {position}.

Would you be open to a brief chat about your experience at {company}?

Best regards,
Your Name`,
      category: 'CONNECTION_REQUEST',
    },
  })

  console.log('✅ Created 1 email template')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('   - 3 companies')
  console.log('   - 2 contacts (1 willing to refer)')
  console.log('   - 3 applications (1 referred, 1 in interview stage)')
  console.log('   - 2 interviews')
  console.log('   - 2 reminders')
  console.log('   - 1 email template')
  console.log('\n✨ Visit http://localhost:3000 to see your tracker in action!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
