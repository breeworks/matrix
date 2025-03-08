/*
  Warnings:

  - You are about to drop the column `date` on the `user` table. All the data in the column will be lost.
  - Added the required column `Date` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "date",
ADD COLUMN     "Date" TIMESTAMP(3) NOT NULL;
