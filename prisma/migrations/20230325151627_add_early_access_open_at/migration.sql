/*
  Warnings:

  - Added the required column `openAt` to the `CollabEarlyAccess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollabEarlyAccess" ADD COLUMN     "openAt" TIMESTAMP(3) NOT NULL;
