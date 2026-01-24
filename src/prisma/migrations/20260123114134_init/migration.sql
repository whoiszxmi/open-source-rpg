-- CreateTable
CREATE TABLE `cursed_stats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `cursedEnergyMax` INTEGER NOT NULL,
    `cursedEnergy` INTEGER NOT NULL,
    `cursedControl` INTEGER NOT NULL,
    `mentalPressure` INTEGER NOT NULL,
    `domainUnlocked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `cursed_stats_characterId_key`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `innate_technique` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `cost` INTEGER NOT NULL,
    `effect` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `binding_vow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` INTEGER NOT NULL,
    `vow` VARCHAR(191) NOT NULL,
    `bonus` VARCHAR(191) NOT NULL,
    `penalty` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cursed_stats` ADD CONSTRAINT `cursed_stats_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `innate_technique` ADD CONSTRAINT `innate_technique_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binding_vow` ADD CONSTRAINT `binding_vow_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
