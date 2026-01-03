# Job Application Tracker

A modern, feature-rich job application tracking system built with Next.js, Prisma, and a beautiful dark gradient UI.

## 🚀 Features

- **Dashboard**: Overview of all applications, interviews, and contacts with analytics
- **Applications**: Track job applications with status updates, salary info, and referrals
- **Contacts**: Manage networking contacts and track referral potential
- **Interviews**: Schedule and track interview rounds with meeting links
- **Reminders**: Set follow-up reminders with overdue tracking
- **Email Templates**: Save and reuse email templates for networking and applications

## 🎨 UI Features

- Modern dark gradient design with animated backgrounds
- Glass morphism effects
- Smooth animations with Framer Motion
- Fully responsive layout
- Status-based color coding

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL or Turso (production)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/doshi-kevin/ApplicationTracker.git
   cd ApplicationTracker/job-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update if needed:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

**⚠️ Important**: SQLite doesn't work well on Vercel. Choose one of these options:

### Option 1: Deploy with Vercel Postgres (Easiest)

1. **Click the Deploy button:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/doshi-kevin/ApplicationTracker)

2. **After deployment:**
   - Go to your Vercel dashboard
   - Navigate to Storage → Create Database → Postgres
   - Vercel will automatically inject the `DATABASE_URL` environment variable

3. **Update your schema** (only if using Postgres):
   In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. **Redeploy** to apply the schema changes

### Option 2: Deploy with Turso (Serverless SQLite)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Turso setup instructions.

## 📁 Project Structure

```
job-tracker/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── analytics/       # Analytics endpoints
│   │   ├── applications/    # Application CRUD
│   │   ├── companies/       # Company management
│   │   ├── contacts/        # Contact management
│   │   ├── email-templates/ # Template management
│   │   ├── interviews/      # Interview tracking
│   │   └── reminders/       # Reminder system
│   ├── applications/        # Applications page
│   ├── contacts/           # Contacts page
│   ├── email-templates/    # Email templates page
│   ├── interviews/         # Interviews page
│   ├── reminders/          # Reminders page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard
├── components/             # Reusable components
├── lib/                    # Utility functions
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── public/                 # Static assets
└── uploads/               # File uploads (resumes, cover letters)
```

## 💾 Database Schema

The app uses 7 main models:

1. **Company**: Company information and job postings
2. **Application**: Job applications with status tracking
3. **Contact**: Networking contacts with referral tracking
4. **Interview**: Interview scheduling and feedback
5. **Reminder**: Task reminders and follow-ups
6. **EmailTemplate**: Reusable email templates
7. **Interaction**: Contact interaction history

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create a new migration

## 📝 Environment Variables

Required environment variables:

```env
DATABASE_URL="file:./dev.db"  # SQLite for local development
# OR
DATABASE_URL="postgresql://..."  # PostgreSQL for production
# OR
DATABASE_URL="libsql://..."  # Turso for serverless SQLite
TURSO_AUTH_TOKEN="..."  # Only needed for Turso
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database management with [Prisma](https://www.prisma.io/)
- UI components inspired by modern design patterns
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Made with ❤️ by Kevin Doshi**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
