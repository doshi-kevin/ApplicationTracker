# Deployment Guide

## Quick Deploy to Vercel

### Option 1: SQLite with Turso (Recommended for Vercel)

1. **Create a Turso account and database:**
   ```bash
   # Install Turso CLI
   npm install -g @libsql/client

   # Sign up/login
   turso auth signup
   # or
   turso auth login

   # Create a database
   turso db create job-tracker

   # Get the database URL
   turso db show job-tracker --url

   # Get the auth token
   turso db tokens create job-tracker
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="libsql://[YOUR-DATABASE-URL]"
   TURSO_AUTH_TOKEN="[YOUR-AUTH-TOKEN]"
   ```

3. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. **Push your schema to Turso:**
   ```bash
   npx prisma db push
   ```

5. **Deploy to Vercel:**
   - Push your code to GitHub
   - Import your repository in Vercel
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL`
     - `TURSO_AUTH_TOKEN`
   - Deploy!

### Option 2: Use Vercel Postgres (Alternative)

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **In Vercel Dashboard:**
   - Go to your project
   - Navigate to Storage tab
   - Create a new Postgres database
   - Vercel will automatically add `DATABASE_URL` to your environment variables

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Deploy!**

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Important Notes

- **SQLite locally, Turso/Postgres in production**: The app works with both
- **File uploads**: Resume/cover letter uploads are stored in `/public/uploads` - you may want to use cloud storage (S3, Cloudinary) for production
- **Database migrations**: Use `prisma db push` for development, `prisma migrate` for production

## Build Verification

Test the build locally before deploying:

```bash
npm run build
npm start
```

The app should be available at `http://localhost:3000`
