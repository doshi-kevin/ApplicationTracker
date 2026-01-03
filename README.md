# Job Application Tracker

A comprehensive Next.js application for tracking job applications, LinkedIn contacts, referrals, interviews, and more.

## Features

### Core Features
- **Company Management**: Track companies with names, websites, career pages, and notes
- **Application Tracking**: Monitor application status from applied to accepted/rejected
- **LinkedIn Contact Management**: Track connection requests, messages, meetings, and referral potential
- **Referral Dashboard**: View all contacts willing to refer you
- **Interview Tracking**: Schedule and track multiple interview rounds with feedback
- **Reminders**: Set follow-up reminders for applications and contacts
- **Email Templates**: Pre-built templates for outreach, follow-ups, and thank you notes
- **Analytics Dashboard**: View success rates, response times, and application statistics

### Technical Features
- Dark-themed UI optimized for extended use
- SQLite database with Prisma ORM
- File upload for resumes and cover letters (local storage)
- Fully responsive design
- Type-safe with TypeScript

## Project Structure

```
job-tracker/
├── app/
│   ├── api/                    # API routes
│   │   ├── companies/          # Company CRUD
│   │   ├── applications/       # Application CRUD
│   │   ├── contacts/           # Contact CRUD
│   │   ├── interviews/         # Interview CRUD
│   │   ├── reminders/          # Reminder CRUD
│   │   ├── email-templates/    # Email template CRUD
│   │   └── analytics/          # Analytics data
│   ├── page.tsx                # Dashboard
│   ├── layout.tsx              # Main layout with sidebar
│   └── globals.css             # Global styles with dark theme
├── components/
│   └── Sidebar.tsx             # Navigation sidebar
├── lib/
│   ├── prisma.ts               # Prisma client setup
│   └── fileUpload.ts           # File upload utilities
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
└── uploads/                    # Uploaded files (resumes, cover letters)
```

## Database Schema

### Models
1. **Company** - Companies you're applying to
2. **Application** - Job applications with status tracking
3. **Contact** - LinkedIn contacts with interaction history
4. **Interaction** - Individual interactions with contacts
5. **Interview** - Interview schedules and feedback
6. **Reminder** - Follow-up reminders
7. **EmailTemplate** - Reusable email templates

### Key Relationships
- One Company → Many Applications
- One Company → Many Contacts
- One Contact → Many Interactions
- One Contact → Many Referred Applications
- One Application → Many Interviews
- One Application → Many Reminders

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd job-tracker
```

2. Install dependencies (already done):
```bash
npm install
```

3. The database has already been set up with Prisma migrate

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## Pages to Implement

The following pages still need to be created. Here's the structure for each:

### 1. Applications Page (`app/applications/page.tsx`)
- List all applications with filtering by status
- Add new application form (with file uploads)
- Edit/delete existing applications
- Quick status update toggle

### 2. Contacts Page (`app/contacts/page.tsx`)
- List all LinkedIn contacts
- Filter by company, status, and referral willingness
- Add/edit contacts
- Track interaction history

### 3. Referrals Page (`app/referrals/page.tsx`)
- Show all contacts willing to refer
- Group by company
- Quick actions to track referral requests
- Success tracking

### 4. Interviews Page (`app/interviews/page.tsx`)
- Calendar view of upcoming interviews
- Add/edit interview details
- Track multiple rounds per application
- Add feedback and notes

### 5. Reminders Page (`app/reminders/page.tsx`)
- List all reminders sorted by due date
- Mark as complete
- Filter by type and completion status
- Quick add reminder

### 6. Email Templates Page (`app/email-templates/page.tsx`)
- List templates by category
- Create/edit/delete templates
- Preview templates
- Copy to clipboard

### 7. Analytics Page (`app/analytics/page.tsx`)
- Detailed charts and graphs
- Application trends over time
- Company-wise statistics
- Success rate breakdowns

## API Endpoints

All endpoints are RESTful and return JSON:

- `GET/POST /api/companies` - List/create companies
- `GET/PATCH/DELETE /api/companies/[id]` - Get/update/delete company
- `GET/POST /api/applications` - List/create applications
- `GET/PATCH/DELETE /api/applications/[id]` - Get/update/delete application
- `GET/POST /api/contacts` - List/create contacts
- `GET/PATCH/DELETE /api/contacts/[id]` - Get/update/delete contact
- `GET/POST /api/interviews` - List/create interviews
- `PATCH/DELETE /api/interviews/[id]` - Update/delete interview
- `GET/POST /api/reminders` - List/create reminders
- `PATCH/DELETE /api/reminders/[id]` - Update/delete reminder
- `GET/POST /api/email-templates` - List/create templates
- `PATCH/DELETE /api/email-templates/[id]` - Update/delete template
- `GET /api/analytics` - Get analytics data

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. For production deployment:
```bash
vercel --prod
```

Note: For SQLite in production, you may want to consider migrating to PostgreSQL or using Vercel Postgres for better scalability.

### Alternative: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t job-tracker .
docker run -p 3000:3000 job-tracker
```

## Customization

### Adding New Fields

1. Update the Prisma schema in `prisma/schema.prisma`
2. Create a migration:
```bash
npx prisma migrate dev --name your_migration_name
```
3. Update API routes and UI components

### Changing Theme Colors

Edit the CSS variables in `app/globals.css`:
```css
:root {
  --background: #0a0a0a;  /* Main background */
  --card: #1a1a1a;        /* Card background */
  --primary: #3b82f6;     /* Primary color */
  /* ... */
}
```

## Tips for Usage

1. **Start by adding companies** - Create companies first before applications
2. **Upload resumes** - Each application requires a resume file
3. **Track contacts immediately** - Add LinkedIn connections as soon as you connect
4. **Set reminders** - Use the reminder system to stay on top of follow-ups
5. **Use email templates** - Save time with pre-written messages
6. **Review analytics** - Check your success rates to optimize your approach

## Troubleshooting

### Database Issues
If you encounter database issues, reset it:
```bash
npx prisma migrate reset
npx prisma generate
```

### File Upload Issues
Ensure the uploads directory exists:
```bash
mkdir -p uploads/resumes uploads/cover-letters
```

### Port Already in Use
Change the port in `package.json`:
```json
"dev": "next dev -p 3001"
```

## Future Enhancements

- Email integration for automatic tracking
- Browser extension to add jobs while browsing
- Mobile app
- Calendar sync for interviews
- Notification system
- Export data to CSV/PDF
- Job board integrations
- AI-powered resume matching

## License

MIT License - Feel free to use this for your personal job search!

## Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Happy Job Hunting!** 🎯
