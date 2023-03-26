/*
  Warnings:

  - Added the required column `guildId` to the `UserGuildRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserGuildRole" ADD COLUMN     "guildId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserGuildRole" ADD CONSTRAINT "UserGuildRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
