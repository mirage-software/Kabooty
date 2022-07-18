-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "original" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Pick" SET "original" = true WHERE "characterId" IS NULL;