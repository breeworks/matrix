/*
  Warnings:

  - You are about to drop the column `Date` on the `user` table. All the data in the column will be lost.
  - Added the required column `Dates` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "Date",
ADD COLUMN     "Dates" TIMESTAMP(3) NOT NULL;
