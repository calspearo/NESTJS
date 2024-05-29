/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BookAssignment` table. All the data in the column will be lost.
  - Made the column `checkoutDate` on table `BookAssignment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BookAssignment" DROP COLUMN "createdAt",
ALTER COLUMN "checkoutDate" SET NOT NULL,
ALTER COLUMN "checkoutDate" SET DEFAULT CURRENT_TIMESTAMP;
