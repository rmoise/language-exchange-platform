package cache

import (
	"context"
	"errors"
	"fmt"
	"time"
)

var (
	ErrCacheMiss = errors.New("cache miss")
)

// Cache interface defines cache operations
type Cache interface {
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Get(ctx context.Context, key string, dest interface{}) error
	Delete(ctx context.Context, keys ...string) error
	DeletePattern(ctx context.Context, pattern string) error
	Exists(ctx context.Context, key string) (bool, error)
	SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error)
	Increment(ctx context.Context, key string) (int64, error)
	IncrementBy(ctx context.Context, key string, amount int64) (int64, error)
	Expire(ctx context.Context, key string, expiration time.Duration) error
	TTL(ctx context.Context, key string) (time.Duration, error)
	Health(ctx context.Context) error
}

// Keys for different cache types
const (
	// Posts
	PostKey        = "post:%s"
	PostsListKey   = "posts:%s:%d:%d" // category:limit:offset
	UserPostsKey   = "user_posts:%s:%d:%d" // userID:limit:offset
	
	// Bookmarks
	BookmarksKey   = "bookmarks:%s:%d:%d" // userID:limit:offset
	BookmarkStatus = "bookmark_status:%s:%s" // userID:postID
	
	// Users
	UserKey        = "user:%s"
	
	// Conversations
	ConversationsKey = "conversations:%s:%d:%d" // userID:limit:offset
	MessagesKey     = "messages:%s:%d:%d" // conversationID:limit:offset
	
	// Rate limiting
	RateLimitKey   = "rate_limit:%s:%s" // endpoint:userID
)

// Cache durations
const (
	ShortDuration  = 5 * time.Minute
	MediumDuration = 30 * time.Minute
	LongDuration   = 2 * time.Hour
	DayDuration    = 24 * time.Hour
)

// CacheKeyBuilder helps build cache keys
type CacheKeyBuilder struct{}

func NewCacheKeyBuilder() *CacheKeyBuilder {
	return &CacheKeyBuilder{}
}

func (c *CacheKeyBuilder) PostKey(postID string) string {
	return fmt.Sprintf(PostKey, postID)
}

func (c *CacheKeyBuilder) PostsListKey(category string, limit, offset int) string {
	return fmt.Sprintf(PostsListKey, category, limit, offset)
}

func (c *CacheKeyBuilder) UserPostsKey(userID string, limit, offset int) string {
	return fmt.Sprintf(UserPostsKey, userID, limit, offset)
}

func (c *CacheKeyBuilder) BookmarksKey(userID string, limit, offset int) string {
	return fmt.Sprintf(BookmarksKey, userID, limit, offset)
}

func (c *CacheKeyBuilder) BookmarkStatusKey(userID, postID string) string {
	return fmt.Sprintf(BookmarkStatus, userID, postID)
}

func (c *CacheKeyBuilder) UserKey(userID string) string {
	return fmt.Sprintf(UserKey, userID)
}

func (c *CacheKeyBuilder) ConversationsKey(userID string, limit, offset int) string {
	return fmt.Sprintf(ConversationsKey, userID, limit, offset)
}

func (c *CacheKeyBuilder) MessagesKey(conversationID string, limit, offset int) string {
	return fmt.Sprintf(MessagesKey, conversationID, limit, offset)
}

func (c *CacheKeyBuilder) RateLimitKey(endpoint, userID string) string {
	return fmt.Sprintf(RateLimitKey, endpoint, userID)
}