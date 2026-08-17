-- CreateTable
CREATE TABLE `chamado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `prioridade` ENUM('BAIXA', 'MEDIA', 'ALTA') NOT NULL,
    `status` ENUM('ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO') NOT NULL,
    `usuario_id` INTEGER NULL,
    `tecnico_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_completo` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `cargo` ENUM('TECNICO', 'USUARIO') NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `espcialidade` ENUM('HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO') NOT NULL,
    `setor` ENUM('ADMINISTRATIVO', 'FINANCEIRO', 'RECURSOS_HUMANOS', 'COMERCIAL', 'MARKETING', 'TECNOLOGIA', 'OPERACOES') NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pessoa_cpf_key`(`cpf`),
    UNIQUE INDEX `pessoa_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `pessoa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chamado` ADD CONSTRAINT `chamado_tecnico_id_fkey` FOREIGN KEY (`tecnico_id`) REFERENCES `pessoa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
