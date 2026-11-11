ALTER TABLE complaints
MODIFY COLUMN is_public TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN is_anonymous TINYINT(1) NOT NULL DEFAULT 0
AFTER is_public;

UPDATE complaints
SET is_public = 1
WHERE is_public <> 1;
