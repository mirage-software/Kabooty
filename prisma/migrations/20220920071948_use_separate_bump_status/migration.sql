/*
  Warnings:

  - The values [BUMP] on the enum `CollabStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "BumpStatus" AS ENUM ('ENABLED', 'DISABLED');

-- AlterEnum
BEGIN;
CREATE TYPE "CollabStatus_new" AS ENUM ('DESIGN', 'EARLY_ACCESS', 'OPEN', 'RELEASE', 'CLOSED');
ALTER TABLE "Collab" ALTER COLUMN "status" TYPE "CollabStatus_new" USING ("status"::text::"CollabStatus_new");
ALTER TYPE "CollabStatus" RENAME TO "CollabStatus_old";
ALTER TYPE "CollabStatus_new" RENAME TO "CollabStatus";
DROP TYPE "CollabStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Collab" ADD COLUMN     "bumpStatus" "BumpStatus" NOT NULL DEFAULT E'DISABLED';
