/*
  Warnings:

  - A unique constraint covering the columns `[password]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_username_key";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_password_key" ON "user"("password");
