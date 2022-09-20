-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "valid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "valid" BOOLEAN NOT NULL DEFAULT false;
