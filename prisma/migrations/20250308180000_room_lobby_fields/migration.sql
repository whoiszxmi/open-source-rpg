ALTER TABLE `room`
  ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'LOBBY',
  ADD COLUMN `ownerId` INTEGER NULL,
  ADD COLUMN `scenarioId` INTEGER NULL;

ALTER TABLE `room_participant`
  MODIFY COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'PLAYER',
  ADD COLUMN `isReady` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `room`
  ADD CONSTRAINT `room_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `character`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `room_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `scenario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `room_participant`
  DROP FOREIGN KEY `room_participant_roomId_fkey`,
  DROP FOREIGN KEY `room_participant_characterId_fkey`;

ALTER TABLE `room_participant`
  ADD CONSTRAINT `room_participant_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `room_participant_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
