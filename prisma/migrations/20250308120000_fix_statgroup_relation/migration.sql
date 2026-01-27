-- Remove duplicate stat groups per character/type
DELETE sg1
FROM stat_group sg1
JOIN stat_group sg2
  ON sg1.characterId = sg2.characterId
 AND sg1.type = sg2.type
 AND sg1.id > sg2.id;

-- Drop legacy one-to-one stat group references from character
ALTER TABLE `character`
  DROP COLUMN `statsPhysicalId`,
  DROP COLUMN `statsJujutsuId`,
  DROP COLUMN `statsMentalId`,
  DROP COLUMN `statsExtraId`,
  DROP COLUMN `statGroupId`;
