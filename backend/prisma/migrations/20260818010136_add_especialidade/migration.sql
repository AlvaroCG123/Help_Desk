/*
  Warnings:

  - Added the required column `especialidade_id` to the `pessoa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pessoa` ADD COLUMN `especialidade_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `especialidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pessoa` ADD CONSTRAINT `pessoa_especialidade_id_fkey` FOREIGN KEY (`especialidade_id`) REFERENCES `especialidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
