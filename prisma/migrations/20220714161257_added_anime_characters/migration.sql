-- CreateTable
CREATE TABLE "AnimeCharacter" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "anime_name" TEXT NOT NULL,

    CONSTRAINT "AnimeCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimeCharacter_name_idx" ON "AnimeCharacter"("name");
