-- CreateTable
CREATE TABLE `domain_state` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `turnsRemaining` INTEGER NOT NULL,
    `sureHitActive` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `domain_state_characterId_key`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `domain_state` ADD CONSTRAINT `domain_state_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
