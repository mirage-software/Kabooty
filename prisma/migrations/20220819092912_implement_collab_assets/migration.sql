-- CreateTable
CREATE TABLE "CollabAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collabId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "assetWidth" INTEGER NOT NULL,
    "assetHeight" INTEGER NOT NULL,

    CONSTRAINT "CollabAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT NOT NULL,
    "collabId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickId" TEXT NOT NULL,
    "collabAssetId" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CollabAsset" ADD CONSTRAINT "CollabAsset_collabId_fkey" FOREIGN KEY ("collabId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_collabId_fkey" FOREIGN KEY ("collabId") REFERENCES "Collab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_collabAssetId_fkey" FOREIGN KEY ("collabAssetId") REFERENCES "CollabAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "Pick"("id") ON DELETE CASCADE ON UPDATE CASCADE;
