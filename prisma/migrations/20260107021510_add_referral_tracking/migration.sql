-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "hasReferred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReferring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedinConnectedAt" TIMESTAMP(3),
ADD COLUMN     "linkedinRequestSentAt" TIMESTAMP(3),
ADD COLUMN     "referralCompletedAt" TIMESTAMP(3),
ADD COLUMN     "referralRequestedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Contact_isReferring_idx" ON "Contact"("isReferring");

-- CreateIndex
CREATE INDEX "Contact_hasReferred_idx" ON "Contact"("hasReferred");
