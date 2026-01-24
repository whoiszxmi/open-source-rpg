-- CreateTable
CREATE TABLE `character` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NULL,
    `gender` VARCHAR(191) NULL,
    `player_name` VARCHAR(191) NULL,
    `current_hit_points` INTEGER NOT NULL DEFAULT 0,
    `max_hit_points` INTEGER NOT NULL DEFAULT 0,
    `current_picture` INTEGER NOT NULL DEFAULT 1,
    `is_dead` BOOLEAN NOT NULL DEFAULT false,
    `standard_character_picture_url` VARCHAR(191) NULL,
    `injured_character_picture_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_attributes` (
    `character_id` INTEGER NOT NULL,
    `attribute_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`character_id`, `attribute_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_skills` (
    `character_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`character_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roll` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `max_number` INTEGER NOT NULL,
    `rolled_number` INTEGER NOT NULL,
    `character_id` INTEGER NOT NULL,
    `rolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,

    UNIQUE INDEX `config_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `combat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `participants` JSON NULL,
    `roundNumber` INTEGER NOT NULL DEFAULT 1,
    `turnIndex` INTEGER NOT NULL DEFAULT 0,
    `turnOrder` JSON NULL,
    `actedThisRound` JSON NULL,

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
ALTER TABLE `character_attributes` ADD CONSTRAINT `character_attributes_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_attributes` ADD CONSTRAINT `character_attributes_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_skills` ADD CONSTRAINT `character_skills_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_skills` ADD CONSTRAINT `character_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roll` ADD CONSTRAINT `roll_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursed_stats` ADD CONSTRAINT `cursed_stats_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `innate_technique` ADD CONSTRAINT `innate_technique_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `binding_vow` ADD CONSTRAINT `binding_vow_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domain_state` ADD CONSTRAINT `domain_state_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `combat_status` ADD CONSTRAINT `combat_status_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `combat_log` ADD CONSTRAINT `combat_log_combatId_fkey` FOREIGN KEY (`combatId`) REFERENCES `combat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
