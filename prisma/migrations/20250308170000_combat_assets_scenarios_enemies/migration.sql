ALTER TABLE `combat`
  ADD COLUMN `scenarioId` INTEGER NULL;

ALTER TABLE `asset`
  CHANGE COLUMN `fileUrl` `url` VARCHAR(191) NOT NULL,
  ADD COLUMN `storage` VARCHAR(191) NOT NULL DEFAULT 'local',
  ADD COLUMN `mime` VARCHAR(191) NULL,
  ADD COLUMN `size` INTEGER NULL;

CREATE TABLE `appearance_profile` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `ownerType` VARCHAR(191) NOT NULL,
  `ownerId` INTEGER NOT NULL,
  `baseSkinAssetId` INTEGER NULL,
  `idleAnimAssetId` INTEGER NULL,
  `walkAnimAssetId` INTEGER NULL,
  `hurtAnimAssetId` INTEGER NULL,
  `deathAnimAssetId` INTEGER NULL,
  `notes` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `appearance_profile_ownerType_ownerId_idx`(`ownerType`, `ownerId`),
  UNIQUE INDEX `appearance_profile_ownerType_ownerId_key`(`ownerType`, `ownerId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `action_animation_map` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `ownerType` VARCHAR(191) NOT NULL,
  `ownerId` INTEGER NOT NULL,
  `actionKey` VARCHAR(191) NOT NULL,
  `animAssetId` INTEGER NOT NULL,
  `vfxAssetId` INTEGER NULL,
  `sfxAssetId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `action_animation_map_ownerType_ownerId_idx`(`ownerType`, `ownerId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `scenario` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `backgroundAssetId` INTEGER NULL,
  `propsJson` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `enemy_template` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `baseStatsJson` JSON NULL,
  `techniquesJson` JSON NULL,
  `appearanceProfileId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `combat_participant` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `combatId` INTEGER NOT NULL,
  `entityType` VARCHAR(191) NOT NULL,
  `entityId` INTEGER NOT NULL,
  `team` VARCHAR(191) NOT NULL,
  `initiative` INTEGER NULL,
  `isAlive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `combat_participant_combatId_idx`(`combatId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `combat`
  ADD CONSTRAINT `combat_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `scenario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `appearance_profile`
  ADD CONSTRAINT `appearance_profile_baseSkinAssetId_fkey` FOREIGN KEY (`baseSkinAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appearance_profile_idleAnimAssetId_fkey` FOREIGN KEY (`idleAnimAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appearance_profile_walkAnimAssetId_fkey` FOREIGN KEY (`walkAnimAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appearance_profile_hurtAnimAssetId_fkey` FOREIGN KEY (`hurtAnimAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appearance_profile_deathAnimAssetId_fkey` FOREIGN KEY (`deathAnimAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `action_animation_map`
  ADD CONSTRAINT `action_animation_map_animAssetId_fkey` FOREIGN KEY (`animAssetId`) REFERENCES `asset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `action_animation_map_vfxAssetId_fkey` FOREIGN KEY (`vfxAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `action_animation_map_sfxAssetId_fkey` FOREIGN KEY (`sfxAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `scenario`
  ADD CONSTRAINT `scenario_backgroundAssetId_fkey` FOREIGN KEY (`backgroundAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `enemy_template`
  ADD CONSTRAINT `enemy_template_appearanceProfileId_fkey` FOREIGN KEY (`appearanceProfileId`) REFERENCES `appearance_profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `combat_participant`
  ADD CONSTRAINT `combat_participant_combatId_fkey` FOREIGN KEY (`combatId`) REFERENCES `combat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
