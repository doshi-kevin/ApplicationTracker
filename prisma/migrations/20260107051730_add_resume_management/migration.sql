-- CreateTable
CREATE TABLE "ResumeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "latexCode" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeTemplate_name_idx" ON "ResumeTemplate"("name");

-- CreateIndex
CREATE INDEX "ResumeSection_templateId_idx" ON "ResumeSection"("templateId");

-- CreateIndex
CREATE INDEX "ResumeSection_name_idx" ON "ResumeSection"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSection_templateId_name_key" ON "ResumeSection"("templateId", "name");

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
