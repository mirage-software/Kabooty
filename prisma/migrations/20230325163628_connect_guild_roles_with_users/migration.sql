/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "UserGuildRole" (
    "userId" TEXT NOT NULL,
    "guildRoleId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGuildRole_userId_guildRoleId_key" ON "UserGuildRole"("userId", "guildRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "UserGuildRole" ADD CONSTRAINT "UserGuildRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGuildRole" ADD CONSTRAINT "UserGuildRole_guildRoleId_fkey" FOREIGN KEY ("guildRoleId") REFERENCES "GuildRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
