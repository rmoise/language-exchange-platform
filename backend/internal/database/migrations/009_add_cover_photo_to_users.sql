-- Add cover_photo column to users table
ALTER TABLE users ADD COLUMN cover_photo VARCHAR(500);

-- Add index for cover_photo (optional, for future queries)
CREATE INDEX idx_users_cover_photo ON users(cover_photo) WHERE cover_photo IS NOT NULL;