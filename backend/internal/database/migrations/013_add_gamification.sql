-- Add gamification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Create user_stats table for detailed statistics
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_connections INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    minutes_practiced INTEGER DEFAULT 0,
    messages_exchanged INTEGER DEFAULT 0,
    helpful_replies INTEGER DEFAULT 0,
    posts_created INTEGER DEFAULT 0,
    weekly_xp INTEGER DEFAULT 0,
    monthly_xp INTEGER DEFAULT 0,
    weekly_xp_updated_at TIMESTAMP DEFAULT NOW(),
    monthly_xp_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10), -- Emoji or icon identifier
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category VARCHAR(50),
    requirement_type VARCHAR(50), -- 'streak', 'sessions', 'connections', etc.
    requirement_value INTEGER,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_badges table for earned badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    UNIQUE(user_id, badge_id)
);

-- Create xp_transactions table for tracking XP history
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'session_complete', 'match_request', 'post_created', etc.
    action_id UUID, -- Reference to the related action (session_id, post_id, etc.)
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    xp_reward INTEGER NOT NULL,
    target_value INTEGER NOT NULL,
    category VARCHAR(50) CHECK (category IN ('conversation', 'learning', 'social', 'practice')),
    action_type VARCHAR(50) NOT NULL, -- Maps to specific actions to track
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_daily_challenges table for tracking progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_date ON user_daily_challenges(user_id, date);

-- Insert initial badge definitions
INSERT INTO badges (code, name, description, icon, rarity, category, requirement_type, requirement_value, xp_reward) VALUES
-- Common badges
('first_session', 'First Steps', 'Complete your first session', '👶', 'common', 'milestone', 'sessions', 1, 10),
('streak_3', 'Getting Started', '3-day streak', '🔥', 'common', 'streak', 'streak', 3, 15),
('words_10', 'Word Collector', 'Learn 10 words', '📝', 'common', 'learning', 'words', 10, 20),
('connections_5', 'Social Butterfly', 'Make 5 connections', '🤝', 'common', 'social', 'connections', 5, 25),

-- Rare badges
('streak_7', 'Week Warrior', '7-day streak', '💪', 'rare', 'streak', 'streak', 7, 50),
('streak_30', 'Dedicated Learner', '30-day streak', '💎', 'rare', 'streak', 'streak', 30, 200),
('helper_10', 'Community Pillar', 'Help 10 learners', '🏆', 'rare', 'social', 'helpful_replies', 10, 100),
('sessions_50', 'Conversation Expert', '50 sessions completed', '🎓', 'rare', 'milestone', 'sessions', 50, 150),

-- Epic badges
('streak_100', 'Unstoppable', '100-day streak', '⚡', 'epic', 'streak', 'streak', 100, 500),
('polyglot', 'Polyglot', 'Learn 3+ languages', '🌍', 'epic', 'learning', 'languages', 3, 300),
('sessions_100', 'Session Master', 'Complete 100 sessions', '🎯', 'epic', 'milestone', 'sessions', 100, 400),

-- Legendary badges
('streak_365', 'Year of Learning', '365-day streak', '👑', 'legendary', 'streak', 'streak', 365, 1000),
('mentor_100', 'Master Teacher', 'Mentor 100 students', '🌟', 'legendary', 'social', 'mentored', 100, 800),
('grandmaster', 'Language Grandmaster', 'Reach level 10', '🏅', 'legendary', 'milestone', 'level', 10, 1500)
ON CONFLICT (code) DO NOTHING;

-- Insert initial daily challenges
INSERT INTO daily_challenges (title, description, icon, xp_reward, target_value, category, action_type) VALUES
('Morning Conversation', 'Have a 30-minute conversation session', '💬', 50, 30, 'conversation', 'session_minutes'),
('Vocabulary Builder', 'Learn 10 new words', '📚', 30, 10, 'learning', 'words_learned'),
('Community Support', 'Help answer 2 questions', '🤝', 40, 2, 'social', 'helpful_replies'),
('Practice Makes Perfect', 'Complete 15 flashcard reviews', '🎯', 20, 15, 'practice', 'flashcards_reviewed'),
('Connect & Learn', 'Send 3 match requests', '🌐', 25, 3, 'social', 'match_requests_sent'),
('Active Participant', 'Exchange 20 messages', '✉️', 35, 20, 'conversation', 'messages_sent')
ON CONFLICT DO NOTHING;

-- Create function to calculate user level from XP
CREATE OR REPLACE FUNCTION get_user_level(xp INTEGER) RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN xp < 100 THEN 1
        WHEN xp < 250 THEN 2
        WHEN xp < 500 THEN 3
        WHEN xp < 1000 THEN 4
        WHEN xp < 2000 THEN 5
        WHEN xp < 3500 THEN 6
        WHEN xp < 5000 THEN 7
        WHEN xp < 7500 THEN 8
        WHEN xp < 10000 THEN 9
        ELSE 10
    END;
END;
$$ LANGUAGE plpgsql;

-- Create function to update weekly and monthly XP
CREATE OR REPLACE FUNCTION update_periodic_xp() RETURNS TRIGGER AS $$
BEGIN
    -- Update weekly XP if it's a new week
    IF NEW.weekly_xp_updated_at < date_trunc('week', NOW()) THEN
        NEW.weekly_xp := 0;
        NEW.weekly_xp_updated_at := NOW();
    END IF;
    
    -- Update monthly XP if it's a new month
    IF NEW.monthly_xp_updated_at < date_trunc('month', NOW()) THEN
        NEW.monthly_xp := 0;
        NEW.monthly_xp_updated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for periodic XP updates
CREATE TRIGGER update_periodic_xp_trigger
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_periodic_xp();

-- Initialize user_stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;