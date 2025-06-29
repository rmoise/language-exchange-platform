-- Create user_stats records for all users who don't have them
INSERT INTO user_stats (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_stats)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure all gamification fields have default values
UPDATE users 
SET total_xp = COALESCE(total_xp, 0),
    current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0)
WHERE total_xp IS NULL OR current_streak IS NULL OR longest_streak IS NULL;

-- Insert sample badges if they don't exist
INSERT INTO badges (code, name, description, icon, rarity, category, requirement_type, requirement_value, xp_reward) VALUES
('first_connection', 'First Connection', 'Made your first language partner connection', '🤝', 'common', 'social', 'connections', 1, 10),
('social_butterfly', 'Social Butterfly', 'Connected with 10 language partners', '🦋', 'uncommon', 'social', 'connections', 10, 50),
('networking_pro', 'Networking Pro', 'Connected with 25 language partners', '🌐', 'rare', 'social', 'connections', 25, 100),
('conversation_starter', 'Conversation Starter', 'Completed your first session', '💬', 'common', 'learning', 'sessions', 1, 10),
('dedicated_learner', 'Dedicated Learner', 'Completed 10 sessions', '📚', 'uncommon', 'learning', 'sessions', 10, 50),
('language_enthusiast', 'Language Enthusiast', 'Completed 50 sessions', '🎓', 'rare', 'learning', 'sessions', 50, 100),
('streak_beginner', 'Streak Beginner', 'Maintained a 3-day streak', '🔥', 'common', 'consistency', 'streak', 3, 20),
('streak_keeper', 'Streak Keeper', 'Maintained a 7-day streak', '⚡', 'uncommon', 'consistency', 'streak', 7, 50),
('streak_master', 'Streak Master', 'Maintained a 30-day streak', '🌟', 'rare', 'consistency', 'streak', 30, 200),
('helpful_member', 'Helpful Member', 'Posted 5 helpful replies', '🙌', 'common', 'community', 'helpful_replies', 5, 30),
('community_pillar', 'Community Pillar', 'Posted 20 helpful replies', '🏛️', 'uncommon', 'community', 'helpful_replies', 20, 100),
('vocabulary_builder', 'Vocabulary Builder', 'Learned 100 words', '📖', 'uncommon', 'learning', 'words', 100, 50),
('polyglot_path', 'On the Polyglot Path', 'Learned 500 words', '🗣️', 'rare', 'learning', 'words', 500, 150)
ON CONFLICT (code) DO NOTHING;

-- Insert sample daily challenges if they don't exist
INSERT INTO daily_challenges (title, description, icon, xp_reward, target_value, category, action_type, is_active) VALUES
('Practice Makes Perfect', 'Complete a 30-minute practice session', '⏱️', 50, 30, 'practice', 'session_minutes', true),
('Connect & Learn', 'Send 2 match requests', '🤝', 30, 2, 'social', 'match_requests_sent', true),
('Help Others', 'Post 1 helpful reply', '💡', 40, 1, 'community', 'helpful_replies', true),
('Stay Consistent', 'Practice for any amount of time', '✅', 20, 1, 'consistency', 'daily_login', true)
ON CONFLICT DO NOTHING;