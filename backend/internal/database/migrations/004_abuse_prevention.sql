-- Request logging table for tracking all connection actions
CREATE TABLE IF NOT EXISTS request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('sent', 'cancelled', 'accepted', 'declined')),
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_id UUID REFERENCES match_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for request logs
CREATE INDEX idx_request_logs_user_id ON request_logs(user_id);
CREATE INDEX idx_request_logs_recipient_id ON request_logs(recipient_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX idx_request_logs_ip_address ON request_logs(ip_address);

-- User blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_by VARCHAR(50) NOT NULL, -- 'system' or admin user ID
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index for checking active blocks
CREATE INDEX idx_user_blocks_expires_at ON user_blocks(expires_at);

-- Notification throttling table
CREATE TABLE IF NOT EXISTS notification_throttles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    last_sent TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, notification_type)
);

-- Index for throttle cleanup
CREATE INDEX idx_notification_throttles_window_start ON notification_throttles(window_start);

-- Abuse reports table
CREATE TABLE IF NOT EXISTS abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for abuse reports
CREATE INDEX idx_abuse_reports_reported_id ON abuse_reports(reported_id);
CREATE INDEX idx_abuse_reports_status ON abuse_reports(status);
CREATE INDEX idx_abuse_reports_created_at ON abuse_reports(created_at);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_uuid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_blocks 
        WHERE user_id = user_uuid 
        AND expires_at > CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- Function to count abuse reports for a user
CREATE OR REPLACE FUNCTION count_user_abuse_reports(user_uuid UUID, days INTEGER DEFAULT 30) 
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM abuse_reports 
        WHERE reported_id = user_uuid 
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 day' * days
    );
END;
$$ LANGUAGE plpgsql;