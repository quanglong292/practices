/*
  Warnings:

  - You are about to drop the column `biograpy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User"
RENAME COLUMN "biograpy" TO "biography"
