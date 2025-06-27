package services

import (
	"context"
	"fmt"
	"log"

	"language-exchange/internal/cache"
	"language-exchange/internal/models"
)

// CachedBookmarkService wraps BookmarkService with caching
type CachedBookmarkService struct {
	bookmarkService *BookmarkService
	cache           cache.Cache
	keyBuilder      *cache.CacheKeyBuilder
}

func NewCachedBookmarkService(bookmarkService *BookmarkService, cacheInstance cache.Cache) *CachedBookmarkService {
	return &CachedBookmarkService{
		bookmarkService: bookmarkService,
		cache:           cacheInstance,
		keyBuilder:      cache.NewCacheKeyBuilder(),
	}
}

// GetUserBookmarks retrieves bookmarks with caching
func (s *CachedBookmarkService) GetUserBookmarks(ctx context.Context, userID string, limit, offset int) ([]models.Post, int, error) {
	cacheKey := s.keyBuilder.BookmarksKey(userID, limit, offset)
	
	// Try cache first
	var result struct {
		Posts      []models.Post `json:"posts"`
		TotalCount int           `json:"total_count"`
	}
	
	err := s.cache.Get(ctx, cacheKey, &result)
	if err == nil {
		return result.Posts, result.TotalCount, nil
	}
	
	if err != cache.ErrCacheMiss {
		log.Printf("Cache error for bookmarks %s: %v", userID, err)
	}
	
	// Cache miss, get from database
	posts, totalCount, err := s.bookmarkService.GetUserBookmarks(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	
	// Cache the result
	result.Posts = posts
	result.TotalCount = totalCount
	
	if err := s.cache.Set(ctx, cacheKey, result, cache.MediumDuration); err != nil {
		log.Printf("Failed to cache bookmarks %s: %v", userID, err)
	}
	
	return posts, totalCount, nil
}

// ToggleBookmark toggles bookmark and invalidates cache
func (s *CachedBookmarkService) ToggleBookmark(ctx context.Context, userID, postID string) (*models.BookmarkResponse, error) {
	response, err := s.bookmarkService.ToggleBookmark(ctx, userID, postID)
	if err != nil {
		return nil, err
	}
	
	// Invalidate bookmark caches
	s.invalidateBookmarkCaches(ctx, userID, postID)
	
	return response, nil
}

// IsBookmarked checks bookmark status with caching
func (s *CachedBookmarkService) IsBookmarked(ctx context.Context, userID, postID string) (bool, error) {
	cacheKey := s.keyBuilder.BookmarkStatusKey(userID, postID)
	
	// Try cache first
	var isBookmarked bool
	err := s.cache.Get(ctx, cacheKey, &isBookmarked)
	if err == nil {
		return isBookmarked, nil
	}
	
	if err != cache.ErrCacheMiss {
		log.Printf("Cache error for bookmark status %s:%s: %v", userID, postID, err)
	}
	
	// Cache miss, get from database
	isBookmarked, err = s.bookmarkService.IsBookmarked(ctx, userID, postID)
	if err != nil {
		return false, err
	}
	
	// Cache the result
	if err := s.cache.Set(ctx, cacheKey, isBookmarked, cache.LongDuration); err != nil {
		log.Printf("Failed to cache bookmark status %s:%s: %v", userID, postID, err)
	}
	
	return isBookmarked, nil
}

// GetBookmarkStatusForPosts gets bookmark status for multiple posts with caching
func (s *CachedBookmarkService) GetBookmarkStatusForPosts(ctx context.Context, userID string, postIDs []string) (map[string]bool, error) {
	result := make(map[string]bool)
	var uncachedPostIDs []string
	
	// Check cache for each post
	for _, postID := range postIDs {
		cacheKey := s.keyBuilder.BookmarkStatusKey(userID, postID)
		
		var isBookmarked bool
		err := s.cache.Get(ctx, cacheKey, &isBookmarked)
		if err == nil {
			result[postID] = isBookmarked
		} else {
			uncachedPostIDs = append(uncachedPostIDs, postID)
		}
	}
	
	// Get uncached statuses from database
	if len(uncachedPostIDs) > 0 {
		dbResult, err := s.bookmarkService.GetBookmarkStatusForPosts(ctx, userID, uncachedPostIDs)
		if err != nil {
			return nil, err
		}
		
		// Cache the results and add to result
		for postID, isBookmarked := range dbResult {
			result[postID] = isBookmarked
			
			cacheKey := s.keyBuilder.BookmarkStatusKey(userID, postID)
			if err := s.cache.Set(ctx, cacheKey, isBookmarked, cache.LongDuration); err != nil {
				log.Printf("Failed to cache bookmark status %s:%s: %v", userID, postID, err)
			}
		}
	}
	
	return result, nil
}

// invalidateBookmarkCaches invalidates bookmark-related caches
func (s *CachedBookmarkService) invalidateBookmarkCaches(ctx context.Context, userID, postID string) {
	// Invalidate bookmark lists for user
	s.cache.DeletePattern(ctx, fmt.Sprintf("bookmarks:%s:*", userID))
	
	// Invalidate bookmark status
	s.cache.Delete(ctx, s.keyBuilder.BookmarkStatusKey(userID, postID))
	
	// Invalidate post cache (bookmark count may have changed)
	s.cache.Delete(ctx, s.keyBuilder.PostKey(postID))
}