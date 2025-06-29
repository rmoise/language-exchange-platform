-- Migration: Add profile visits tracking
-- This allows tracking when users view each other's profiles
-- Users can see how many people visited their profile (premium feature)

CREATE TABLE profile_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    is_visible BOOLEAN DEFAULT true,  -- Whether this visit is visible to the viewed user
    CONSTRAINT different_users CHECK (visitor_id != viewed_id)
);

-- Create indexes for performance
CREATE INDEX idx_profile_visits_viewed_id_viewed_at ON profile_visits(viewed_id, viewed_at DESC);
CREATE INDEX idx_profile_visits_visitor_id ON profile_visits(visitor_id);
CREATE INDEX idx_profile_visits_viewed_at ON profile_visits(viewed_at);

-- Prevent duplicate visits within a short time window (1 hour)
-- This is handled in application logic, but adding a partial unique index as backup
CREATE UNIQUE INDEX idx_profile_visits_unique_recent 
ON profile_visits(visitor_id, viewed_id, date_trunc('hour', viewed_at));

-- Add comments for documentation
COMMENT ON TABLE profile_visits IS 'Tracks when users view each other profiles for premium features';
COMMENT ON COLUMN profile_visits.is_visible IS 'Controls whether this visit appears in the viewed users visitor list';
COMMENT ON INDEX idx_profile_visits_unique_recent IS 'Prevents duplicate visits within the same hour window';