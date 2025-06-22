-- Add photos column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Set default empty array for existing users
UPDATE users SET photos = '{}' WHERE photos IS NULL;