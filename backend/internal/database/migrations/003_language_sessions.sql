-- Language Sessions Migration
-- This creates tables for collaborative language learning sessions

-- Language sessions table
CREATE TABLE IF NOT EXISTS language_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    max_participants INTEGER DEFAULT 2 CHECK (max_participants > 0 AND max_participants <= 10),
    session_type VARCHAR(20) DEFAULT 'practice' CHECK (session_type IN ('practice', 'lesson', 'conversation')),
    target_language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('creator', 'participant', 'observer')),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(session_id, user_id)
);

-- Canvas operations table for whiteboard persistence
CREATE TABLE IF NOT EXISTS canvas_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('text', 'draw', 'erase', 'clear', 'move', 'delete')),
    operation_data JSONB NOT NULL,
    sequence_number BIGSERIAL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session messages table for chat
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file', 'voice')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_language_sessions_created_by ON language_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_language_sessions_status ON language_sessions(status);
CREATE INDEX IF NOT EXISTS idx_language_sessions_created_at ON language_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_active ON session_participants(session_id, is_active);

CREATE INDEX IF NOT EXISTS idx_canvas_operations_session_id ON canvas_operations(session_id);
CREATE INDEX IF NOT EXISTS idx_canvas_operations_sequence ON canvas_operations(session_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_canvas_operations_timestamp ON canvas_operations(session_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_timestamp ON session_messages(session_id, timestamp);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_language_sessions_updated_at 
    BEFORE UPDATE ON language_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();