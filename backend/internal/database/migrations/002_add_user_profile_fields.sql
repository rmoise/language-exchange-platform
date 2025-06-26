-- Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) UNIQUE,
ADD COLUMN profile_image TEXT,
ADD COLUMN city VARCHAR(255),
ADD COLUMN country VARCHAR(255),
ADD COLUMN timezone VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN bio TEXT,
ADD COLUMN interests TEXT[],
ADD COLUMN onboarding_step INTEGER DEFAULT 0,
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_location ON users(city, country) WHERE city IS NOT NULL AND country IS NOT NULL;
CREATE INDEX idx_users_coordinates ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_users_onboarding_step ON users(onboarding_step);
CREATE INDEX idx_users_interests ON users USING GIN(interests) WHERE interests IS NOT NULL;

-- Function to update updated_at timestamp for users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Allow password_hash to be null for Google OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;