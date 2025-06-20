-- Add username column to users table
ALTER TABLE users 
ADD COLUMN username VARCHAR(30) UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Add constraint to ensure username follows pattern
ALTER TABLE users 
ADD CONSTRAINT username_pattern CHECK (username ~ '^[a-zA-Z0-9_-]+$');