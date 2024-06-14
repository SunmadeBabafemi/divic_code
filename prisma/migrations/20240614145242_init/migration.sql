/*
  Warnings:

  - You are about to drop the column `biometicKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "biometicKey",
ADD COLUMN     "biometricKey" TEXT;
