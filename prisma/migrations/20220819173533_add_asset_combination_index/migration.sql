/*
  Warnings:

  - A unique constraint covering the columns `[pickId,collabAssetId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Asset_pickId_collabAssetId_key" ON "Asset"("pickId", "collabAssetId");
