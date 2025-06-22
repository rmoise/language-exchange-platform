-- Add invited_user_id to language_sessions for match-only invitations
-- This migration adds support for inviting specific matched users to sessions

ALTER TABLE language_sessions 
ADD COLUMN invited_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for invited user lookups
CREATE INDEX IF NOT EXISTS idx_language_sessions_invited_user ON language_sessions(invited_user_id);

-- Add comment to document the purpose
COMMENT ON COLUMN language_sessions.invited_user_id IS 'ID of the specific user invited to this session. Only the creator and invited user can join.';