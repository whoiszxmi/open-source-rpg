-- CreateTable
CREATE TABLE `combat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `combat_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `combatId` INTEGER NOT NULL,
    `actorId` INTEGER NOT NULL,
    `targetId` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `combat_log_combatId_idx`(`combatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `combat_log` ADD CONSTRAINT `combat_log_combatId_fkey` FOREIGN KEY (`combatId`) REFERENCES `combat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
