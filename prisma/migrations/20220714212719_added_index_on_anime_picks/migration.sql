/*
  Warnings:

  - A unique constraint covering the columns `[collabId,characterId]` on the table `Pick` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pick_collabId_characterId_key" ON "Pick"("collabId", "characterId");
