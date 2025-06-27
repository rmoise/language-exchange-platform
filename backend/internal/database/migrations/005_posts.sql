-- Create posts table with optimizations for scale
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_emoji VARCHAR(10),
    asking_for VARCHAR(100),
    
    -- Denormalized counters for performance (updated via triggers)
    comment_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    
    -- For cursor-based pagination
    cursor_id BIGSERIAL UNIQUE NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id, emoji)
);

-- Create comments table (replies)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create comment_reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(comment_id, user_id, emoji)
);

-- Create optimized indexes for scale
-- Compound indexes for common queries
CREATE INDEX idx_posts_cursor_pagination ON posts(cursor_id DESC, created_at DESC);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_category_created ON posts(category, created_at DESC);

-- Regular index for recent posts (without partial condition since NOW() is not immutable)
CREATE INDEX idx_posts_recent ON posts(created_at DESC);

-- Index for full-text search on title and content
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));

-- Reaction indexes
CREATE INDEX idx_post_reactions_post_user ON post_reactions(post_id, user_id);
CREATE INDEX idx_post_reactions_post_emoji ON post_reactions(post_id, emoji);

-- Comment indexes
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at);
CREATE INDEX idx_comments_parent_created ON comments(parent_comment_id, created_at) 
    WHERE parent_comment_id IS NOT NULL;

-- Comment reaction indexes
CREATE INDEX idx_comment_reactions_comment_user ON comment_reactions(comment_id, user_id);
CREATE INDEX idx_comment_reactions_comment_emoji ON comment_reactions(comment_id, emoji);

-- Create triggers to update denormalized counters
-- Update comment count trigger
CREATE OR REPLACE FUNCTION update_post_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Update reaction count trigger
CREATE OR REPLACE FUNCTION update_post_reaction_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_post_reaction_count
AFTER INSERT OR DELETE ON post_reactions
FOR EACH ROW EXECUTE FUNCTION update_post_reaction_count();

-- Create a materialized view for trending posts (refresh periodically)
CREATE MATERIALIZED VIEW trending_posts AS
SELECT 
    p.id,
    p.user_id,
    p.title,
    p.category,
    p.created_at,
    p.comment_count,
    p.reaction_count,
    (p.comment_count * 2 + p.reaction_count + 
     EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) as trending_score
FROM posts p
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY trending_score DESC
LIMIT 100;

CREATE INDEX idx_trending_posts_score ON trending_posts(trending_score DESC);