-- Migration: Add messaging system tables
-- This creates the conversations and messages tables for the messaging feature

-- Conversations table: Represents a chat between two users
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure user1_id < user2_id for consistent ordering
    CONSTRAINT conversation_user_order CHECK (user1_id < user2_id),
    -- Ensure unique conversation between two users
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Messages table: Individual messages within conversations
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure content is not empty
    CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Conversation participants view for easier querying
CREATE VIEW conversation_participants AS
SELECT 
    c.id as conversation_id,
    c.user1_id,
    c.user2_id,
    u1.name as user1_name,
    u1.profile_image as user1_image,
    u2.name as user2_name,
    u2.profile_image as user2_image,
    c.created_at,
    c.updated_at,
    c.last_message_at
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id;

-- Indexes for performance
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);

-- Function to get conversation between two users (creates if doesn't exist)
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_user1_id UUID,
    p_user2_id UUID
) RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    ordered_user1_id UUID;
    ordered_user2_id UUID;
BEGIN
    -- Ensure consistent ordering (smaller UUID first)
    IF p_user1_id < p_user2_id THEN
        ordered_user1_id := p_user1_id;
        ordered_user2_id := p_user2_id;
    ELSE
        ordered_user1_id := p_user2_id;
        ordered_user2_id := p_user1_id;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO conversation_id
    FROM conversations 
    WHERE user1_id = ordered_user1_id AND user2_id = ordered_user2_id;
    
    -- Create conversation if it doesn't exist
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (ordered_user1_id, ordered_user2_id)
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation's last_message_at when a message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID, p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO unread_count
    FROM messages 
    WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND status != 'read';
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
-- INSERT INTO conversations (user1_id, user2_id) 
-- SELECT u1.id, u2.id 
-- FROM users u1, users u2 
-- WHERE u1.id != u2.id 
-- AND u1.id < u2.id 
-- LIMIT 3;

COMMENT ON TABLE conversations IS 'Chat conversations between two users';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON FUNCTION get_or_create_conversation IS 'Gets existing conversation or creates new one between two users';
COMMENT ON FUNCTION update_conversation_timestamp IS 'Updates conversation timestamp when new message is sent';
COMMENT ON FUNCTION get_unread_count IS 'Returns unread message count for a user in a conversation';