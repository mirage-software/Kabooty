/*
  Warnings:

  - A unique constraint covering the columns `[discordGuildId]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discordGuildRoleId]` on the table `GuildRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordGuildId_key" ON "Guild"("discordGuildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildRole_discordGuildRoleId_key" ON "GuildRole"("discordGuildRoleId");
