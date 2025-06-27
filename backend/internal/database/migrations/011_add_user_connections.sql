-- Create user_connections table for following relationships
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure a user can't follow the same person twice
    UNIQUE(follower_id, following_id),
    
    -- Ensure a user can't follow themselves
    CHECK(follower_id != following_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_user_connections_follower ON user_connections(follower_id, created_at DESC);
CREATE INDEX idx_user_connections_following ON user_connections(following_id, created_at DESC);

-- Add denormalized counters to users table for performance
ALTER TABLE users 
ADD COLUMN following_count INTEGER DEFAULT 0,
ADD COLUMN followers_count INTEGER DEFAULT 0;

-- Create trigger to update following/followers count
CREATE OR REPLACE FUNCTION update_user_connection_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update following count for follower
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        -- Update followers count for the user being followed
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update following count for follower
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        -- Update followers count for the user being unfollowed
        UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_connection_counts
AFTER INSERT OR DELETE ON user_connections
FOR EACH ROW EXECUTE FUNCTION update_user_connection_counts();

-- Initialize counters for existing users (if any)
UPDATE users SET 
    following_count = (
        SELECT COUNT(*) FROM user_connections 
        WHERE follower_id = users.id
    ),
    followers_count = (
        SELECT COUNT(*) FROM user_connections 
        WHERE following_id = users.id
    );