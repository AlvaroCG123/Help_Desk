/*
  Warnings:

  - You are about to drop the column `prioridade` on the `chamado` table. All the data in the column will be lost.
  - You are about to drop the column `especialidade` on the `pessoa` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `pessoa` table. All the data in the column will be lost.
  - Added the required column `prioridade_id` to the `chamado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setor_id` to the `pessoa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chamado` DROP COLUMN `prioridade`,
    ADD COLUMN `prioridade_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pessoa` DROP COLUMN `especialidade`,
    DROP COLUMN `setor`,
    ADD COLUMN `setor_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `prioridade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo_setor` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dados_pessoais_tecnico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especialidade` ENUM('HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_prioridade_id_fkey` FOREIGN KEY (`prioridade_id`) REFERENCES `prioridade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoa` ADD CONSTRAINT `pessoa_setor_id_fkey` FOREIGN KEY (`setor_id`) REFERENCES `setor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
