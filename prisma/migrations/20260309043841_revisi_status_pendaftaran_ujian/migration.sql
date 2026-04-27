-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusPendaftaran" ADD VALUE 'draft';
ALTER TYPE "StatusPendaftaran" ADD VALUE 'revisi';

-- The default setting is moved to the next migration because of PostgreSQL transaction limitations.
-- ALTER TABLE "pendaftaran_ujian" ALTER COLUMN "status" SET DEFAULT 'draft';
