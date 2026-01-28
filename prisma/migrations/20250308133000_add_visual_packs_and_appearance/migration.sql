-- Add visual pack support
CREATE TABLE `visual_pack` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `packId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `version` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `manifestJson` JSON NOT NULL,
  `basePath` VARCHAR(191) NOT NULL,
  `isPublic` BOOLEAN NOT NULL DEFAULT false,
  `createdBy` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `visual_pack_packId_key`(`packId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `character_appearance` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `characterId` INTEGER NOT NULL,
  `visualPackId` INTEGER NULL,
  `packId` VARCHAR(191) NULL,
  `skinKey` VARCHAR(191) NOT NULL DEFAULT 'default',
  `paletteKey` VARCHAR(191) NULL,
  `scale` DOUBLE NOT NULL DEFAULT 1,
  `offsetX` INTEGER NOT NULL DEFAULT 0,
  `offsetY` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `character_appearance_characterId_key`(`characterId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `scene` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `sceneKey` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `visualPackId` INTEGER NULL,
  `packId` VARCHAR(191) NULL,
  `configJson` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `scene_sceneKey_packId_key`(`sceneKey`, `packId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `character_appearance`
  ADD CONSTRAINT `character_appearance_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `character_appearance_visualPackId_fkey` FOREIGN KEY (`visualPackId`) REFERENCES `visual_pack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `scene`
  ADD CONSTRAINT `scene_visualPackId_fkey` FOREIGN KEY (`visualPackId`) REFERENCES `visual_pack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `combat`
  ADD COLUMN `sceneId` INTEGER NULL,
  ADD COLUMN `sceneKey` VARCHAR(191) NULL,
  ADD COLUMN `scenePackId` VARCHAR(191) NULL;

ALTER TABLE `combat`
  ADD CONSTRAINT `combat_sceneId_fkey` FOREIGN KEY (`sceneId`) REFERENCES `scene`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
