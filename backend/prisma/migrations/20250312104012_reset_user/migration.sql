/*
  Warnings:

  - You are about to drop the column `Dates` on the `user` table. All the data in the column will be lost.
  - Added the required column `Dates` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "Dates" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "Dates";
