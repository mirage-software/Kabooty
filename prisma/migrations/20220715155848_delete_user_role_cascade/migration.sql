-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_discordRoleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userDiscordId_fkey";

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userDiscordId_fkey" FOREIGN KEY ("userDiscordId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_discordRoleId_fkey" FOREIGN KEY ("discordRoleId") REFERENCES "DiscordRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
