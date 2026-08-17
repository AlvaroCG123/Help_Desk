/*
  Warnings:

  - You are about to drop the column `espcialidade` on the `pessoa` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `chamado` table without a default value. This is not possible if the table is not empty.
  - Made the column `usuario_id` on table `chamado` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `chamado` DROP FOREIGN KEY `chamado_tecnico_id_fkey`;

-- DropForeignKey
ALTER TABLE `chamado` DROP FOREIGN KEY `chamado_usuario_id_fkey`;

-- DropIndex
DROP INDEX `chamado_tecnico_id_fkey` ON `chamado`;

-- DropIndex
DROP INDEX `chamado_usuario_id_fkey` ON `chamado`;

-- AlterTable
ALTER TABLE `chamado` ADD COLUMN `aberto_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `categoria_id` INTEGER NOT NULL,
    ADD COLUMN `solucao_problema` VARCHAR(191) NULL,
    MODIFY `usuario_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pessoa` DROP COLUMN `espcialidade`,
    ADD COLUMN `especialidade` ENUM('HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO') NULL,
    MODIFY `setor` ENUM('ADMINISTRATIVO', 'FINANCEIRO', 'RECURSOS_HUMANOS', 'COMERCIAL', 'MARKETING', 'TECNOLOGIA', 'OPERACOES') NULL;

-- CreateTable
CREATE TABLE `historico_chamado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chamado_id` INTEGER NOT NULL,
    `pessoa_id` INTEGER NOT NULL,
    `novo_status` ENUM('ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO') NOT NULL,
    `data_mudanca` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `pessoa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_tecnico_id_fkey` FOREIGN KEY (`tecnico_id`) REFERENCES `pessoa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_chamado` ADD CONSTRAINT `historico_chamado_chamado_id_fkey` FOREIGN KEY (`chamado_id`) REFERENCES `chamado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_chamado` ADD CONSTRAINT `historico_chamado_pessoa_id_fkey` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
