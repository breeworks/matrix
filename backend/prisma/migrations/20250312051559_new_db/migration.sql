/*
  Warnings:

  - You are about to drop the column `todo` on the `user` table. All the data in the column will be lost.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "todo",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "todo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
