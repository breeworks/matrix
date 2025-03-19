/*
  Warnings:

  - A unique constraint covering the columns `[todo]` on the table `todos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "todos_todo_key" ON "todos"("todo");
