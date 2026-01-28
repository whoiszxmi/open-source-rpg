ALTER TABLE `character`
  ADD COLUMN `appearance_key` VARCHAR(191) NULL,
  ADD COLUMN `idle_anim_key` VARCHAR(191) NULL,
  ADD COLUMN `attack_anim_key` VARCHAR(191) NULL,
  ADD COLUMN `hit_anim_key` VARCHAR(191) NULL,
  ADD COLUMN `scene_key` VARCHAR(191) NULL;
