-- CreateTable
CREATE TABLE `combat_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `sourceId` INTEGER NULL,
    `key` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 0,
    `stacks` INTEGER NOT NULL DEFAULT 1,
    `turnsRemaining` INTEGER NOT NULL DEFAULT 1,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `combat_status_characterId_idx`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `combat_status` ADD CONSTRAINT `combat_status_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
