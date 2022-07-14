/*
  Warnings:

  - The `characterId` column on the `Pick` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Pick" DROP COLUMN "characterId",
ADD COLUMN     "characterId" INTEGER;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "AnimeCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
