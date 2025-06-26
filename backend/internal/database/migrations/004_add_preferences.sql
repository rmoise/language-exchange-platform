-- Add preferences columns to users table
ALTER TABLE users 
ADD COLUMN max_distance DECIMAL(10, 2),
ADD COLUMN enable_location_matching BOOLEAN DEFAULT FALSE,
ADD COLUMN preferred_meeting_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for preferences-based searching
CREATE INDEX idx_users_max_distance ON users(max_distance) WHERE max_distance IS NOT NULL;
CREATE INDEX idx_users_location_matching ON users(enable_location_matching) WHERE enable_location_matching = TRUE;
CREATE INDEX idx_users_meeting_types ON users USING GIN(preferred_meeting_types) WHERE preferred_meeting_types IS NOT NULL;