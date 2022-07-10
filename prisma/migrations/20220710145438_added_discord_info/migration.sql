/*
  Warnings:

  - You are about to drop the column `roles` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Osu" ALTER COLUMN "access_token" DROP NOT NULL,
ALTER COLUMN "expires_at" DROP NOT NULL,
ALTER COLUMN "refresh_token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roles",
ADD COLUMN     "joinedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserRole" (
    "userDiscordId" TEXT NOT NULL,
    "discordRoleId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DiscordRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userDiscordId_discordRoleId_key" ON "UserRole"("userDiscordId", "discordRoleId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_discordRoleId_fkey" FOREIGN KEY ("discordRoleId") REFERENCES "DiscordRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
