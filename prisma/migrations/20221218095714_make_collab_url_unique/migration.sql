/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Collab` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collab_url_key" ON "Collab"("url");
