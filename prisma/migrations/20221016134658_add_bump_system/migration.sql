-- CreateEnum
CREATE TYPE "BumpState" AS ENUM ('OPEN', 'MISSED', 'CLOSED');

-- CreateTable
CREATE TABLE "Bump" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "state" "BumpState" NOT NULL DEFAULT E'OPEN',
    "pickId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bump_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bump" ADD CONSTRAINT "Bump_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bump" ADD CONSTRAINT "Bump_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "Pick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
