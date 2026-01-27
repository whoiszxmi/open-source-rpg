-- Add new trait fields
ALTER TABLE `blessing`
  ADD COLUMN `type` VARCHAR(191) NULL,
  ADD COLUMN `tags` JSON NULL,
  ADD COLUMN `excludes` JSON NULL;

ALTER TABLE `curse`
  ADD COLUMN `type` VARCHAR(191) NULL,
  ADD COLUMN `valueGain` INTEGER NULL,
  ADD COLUMN `tags` JSON NULL,
  ADD COLUMN `excludes` JSON NULL;

ALTER TABLE `character_blessing`
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `character_curse`
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Room tables
CREATE TABLE `room` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NULL,
  `code` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `room_code_key`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `room_participant` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `roomId` INTEGER NOT NULL,
  `characterId` INTEGER NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `room_participant_roomId_characterId_key`(`roomId`, `characterId`),
  INDEX `room_participant_roomId_idx`(`roomId`),
  INDEX `room_participant_characterId_idx`(`characterId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `room_participant`
  ADD CONSTRAINT `room_participant_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `room_participant_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Combat room link
ALTER TABLE `combat`
  ADD COLUMN `roomId` INTEGER NULL;

ALTER TABLE `combat`
  ADD CONSTRAINT `combat_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
