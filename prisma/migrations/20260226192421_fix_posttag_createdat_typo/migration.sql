/*
  Warnings:

  - You are about to drop the column `createadAt` on the `PostTag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostTag" DROP COLUMN "createadAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
