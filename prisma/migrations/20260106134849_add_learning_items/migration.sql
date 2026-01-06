-- CreateTable
CREATE TABLE "LearningItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CONCEPT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceUrl" TEXT,
    "additionalLinks" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TO_LEARN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "keyTakeaways" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningItem_type_idx" ON "LearningItem"("type");

-- CreateIndex
CREATE INDEX "LearningItem_status_idx" ON "LearningItem"("status");

-- CreateIndex
CREATE INDEX "LearningItem_priority_idx" ON "LearningItem"("priority");

-- CreateIndex
CREATE INDEX "LearningItem_category_idx" ON "LearningItem"("category");
