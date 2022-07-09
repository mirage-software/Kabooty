/*
  Warnings:

  - Added the required column `access_token` to the `Osu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `Osu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `Osu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Osu" ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refresh_token" TEXT NOT NULL;
