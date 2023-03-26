-- AlterTable
ALTER TABLE "Collab" ADD COLUMN     "guildId" TEXT;

-- CreateTable
CREATE TABLE "CollabEarlyAccess" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collabId" TEXT NOT NULL,
    "guildRoleId" TEXT NOT NULL,

    CONSTRAINT "CollabEarlyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildRole" (
    "id" TEXT NOT NULL,
    "discordGuildRoleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GuildRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Collab" ADD CONSTRAINT "Collab_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabEarlyAccess" ADD CONSTRAINT "CollabEarlyAccess_collabId_fkey" FOREIGN KEY ("collabId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabEarlyAccess" ADD CONSTRAINT "CollabEarlyAccess_guildRoleId_fkey" FOREIGN KEY ("guildRoleId") REFERENCES "GuildRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
