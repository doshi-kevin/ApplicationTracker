-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REMINDER',
    "applicationId" TEXT,
    "contactId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "round" INTEGER,
    "interviewers" TEXT,
    "location" TEXT,
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "Event_applicationId_idx" ON "Event"("applicationId");

-- CreateIndex
CREATE INDEX "Event_contactId_idx" ON "Event"("contactId");

-- CreateIndex
CREATE INDEX "Event_scheduledDate_idx" ON "Event"("scheduledDate");

-- CreateIndex
CREATE INDEX "Event_isCompleted_idx" ON "Event"("isCompleted");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing Interview data to Event table
INSERT INTO "Event" (
  "id",
  "type",
  "applicationId",
  "contactId",
  "title",
  "description",
  "scheduledDate",
  "duration",
  "round",
  "interviewers",
  "location",
  "meetingLink",
  "status",
  "isCompleted",
  "completedAt",
  "feedback",
  "notes",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  'INTERVIEW' as "type",
  "applicationId",
  NULL as "contactId",
  "title",
  NULL as "description",
  "interviewDate" as "scheduledDate",
  "duration",
  "round",
  "interviewers",
  "location",
  "meetingLink",
  "status",
  CASE WHEN "status" = 'COMPLETED' THEN true ELSE false END as "isCompleted",
  CASE WHEN "status" = 'COMPLETED' THEN "updatedAt" ELSE NULL END as "completedAt",
  "feedback",
  "notes",
  "createdAt",
  "updatedAt"
FROM "Interview";

-- Migrate existing Reminder data to Event table
INSERT INTO "Event" (
  "id",
  "type",
  "applicationId",
  "contactId",
  "title",
  "description",
  "scheduledDate",
  "duration",
  "round",
  "interviewers",
  "location",
  "meetingLink",
  "status",
  "isCompleted",
  "completedAt",
  "feedback",
  "notes",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  CASE
    WHEN "type" = 'FOLLOW_UP' THEN 'REMINDER'
    WHEN "type" = 'NETWORKING' THEN 'NETWORKING_CALL'
    ELSE "type"
  END as "type",
  "applicationId",
  NULL as "contactId",
  "title",
  "description",
  "dueDate" as "scheduledDate",
  NULL as "duration",
  NULL as "round",
  NULL as "interviewers",
  NULL as "location",
  NULL as "meetingLink",
  CASE WHEN "isCompleted" = true THEN 'COMPLETED' ELSE 'PENDING' END as "status",
  "isCompleted",
  "completedAt",
  NULL as "feedback",
  NULL as "notes",
  "createdAt",
  "updatedAt"
FROM "Reminder";
