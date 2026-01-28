ALTER TABLE `character`
  ADD COLUMN `is_npc` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `scene`
  ADD COLUMN `backgroundAssetId` INTEGER NULL,
  ADD COLUMN `musicAssetId` INTEGER NULL,
  ADD COLUMN `meta` JSON NULL;

CREATE TABLE `asset` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `fileUrl` VARCHAR(191) NOT NULL,
  `spritesheetUrl` VARCHAR(191) NULL,
  `frameWidth` INTEGER NULL,
  `frameHeight` INTEGER NULL,
  `animationMap` JSON NULL,
  `meta` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `player_session` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(191) NOT NULL,
  `characterId` INTEGER NOT NULL,
  `combatId` INTEGER NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `player_session_token_key`(`token`),
  INDEX `player_session_characterId_idx`(`characterId`),
  INDEX `player_session_combatId_idx`(`combatId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `scene`
  ADD CONSTRAINT `scene_backgroundAssetId_fkey` FOREIGN KEY (`backgroundAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `scene_musicAssetId_fkey` FOREIGN KEY (`musicAssetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `player_session`
  ADD CONSTRAINT `player_session_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `player_session_combatId_fkey` FOREIGN KEY (`combatId`) REFERENCES `combat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
