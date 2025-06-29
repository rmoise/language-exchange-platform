-- AI usage tracking table for managing user quotas and costs
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(50) DEFAULT 'improvement',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient monthly usage counting
CREATE INDEX idx_ai_usage_user_month ON ai_usage_logs(user_id, created_at);

-- Add plan type to users table for Pro/Free distinction
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;