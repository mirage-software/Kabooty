-- CreateEnum
CREATE TYPE "CollabType" AS ENUM ('OPEN', 'LIMITED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CollabStatus" AS ENUM ('DESIGN', 'EARLY_ACCESS', 'OPEN', 'BUMP', 'RELEASE', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "roles" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("discordId")
);

-- CreateTable
CREATE TABLE "Osu" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "restricted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Osu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsuMode" (
    "id" TEXT NOT NULL,
    "osuId" TEXT NOT NULL,
    "gamemode" TEXT NOT NULL,
    "rank" INTEGER,
    "countryRank" INTEGER,
    "level" INTEGER,
    "pp" INTEGER,
    "rankedScore" INTEGER,
    "hitAccuracy" DECIMAL(65,30),
    "playCount" INTEGER,
    "playTime" INTEGER,
    "lastRefreshed" TIMESTAMP(3),
    "selected" BOOLEAN NOT NULL,

    CONSTRAINT "OsuMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collab" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "logo" TEXT,
    "creatorId" TEXT NOT NULL,
    "type" "CollabType" NOT NULL,
    "status" "CollabStatus" NOT NULL,

    CONSTRAINT "Collab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "characterId" TEXT,
    "collabId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "collabId" TEXT NOT NULL,
    "pickId" TEXT NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Osu_id_key" ON "Osu"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Osu_discordId_key" ON "Osu"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "OsuMode_osuId_gamemode_key" ON "OsuMode"("osuId", "gamemode");

-- AddForeignKey
ALTER TABLE "Osu" ADD CONSTRAINT "Osu_discordId_fkey" FOREIGN KEY ("discordId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsuMode" ADD CONSTRAINT "OsuMode_osuId_fkey" FOREIGN KEY ("osuId") REFERENCES "Osu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collab" ADD CONSTRAINT "Collab_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_collabId_fkey" FOREIGN KEY ("collabId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_collabId_fkey" FOREIGN KEY ("collabId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "Pick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
