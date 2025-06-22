-- Add birthday column to users table
ALTER TABLE users ADD COLUMN birthday DATE;

-- Add index for birthday queries (if needed for age-based filtering in the future)
CREATE INDEX idx_users_birthday ON users(birthday);