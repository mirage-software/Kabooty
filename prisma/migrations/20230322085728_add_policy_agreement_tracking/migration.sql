-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedCookies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedPrivacyPolicy" BOOLEAN NOT NULL DEFAULT false;
