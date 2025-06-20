-- Update existing NULL arrays to empty arrays
UPDATE users 
SET native_languages = ARRAY[]::TEXT[] 
WHERE native_languages IS NULL;

UPDATE users 
SET target_languages = ARRAY[]::TEXT[] 
WHERE target_languages IS NULL;

UPDATE users 
SET interests = ARRAY[]::TEXT[] 
WHERE interests IS NULL;

-- Add default values for array columns
ALTER TABLE users 
ALTER COLUMN native_languages SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN target_languages SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN interests SET DEFAULT ARRAY[]::TEXT[];