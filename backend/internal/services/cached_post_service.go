package services

import (
	"context"
	"fmt"
	"log"

	"language-exchange/internal/cache"
	"language-exchange/internal/models"
)

// CachedPostService wraps PostService with caching
type CachedPostService struct {
	postService PostService
	cache       cache.Cache
	keyBuilder  *cache.CacheKeyBuilder
}

func NewCachedPostService(postService PostService, cacheInstance cache.Cache) *CachedPostService {
	return &CachedPostService{
		postService: postService,
		cache:       cacheInstance,
		keyBuilder:  cache.NewCacheKeyBuilder(),
	}
}

// GetPost retrieves a post with caching
func (s *CachedPostService) GetPost(ctx context.Context, id string) (*models.Post, error) {
	cacheKey := s.keyBuilder.PostKey(id)
	
	// Try cache first
	var post models.Post
	err := s.cache.Get(ctx, cacheKey, &post)
	if err == nil {
		return &post, nil
	}
	
	if err != cache.ErrCacheMiss {
		log.Printf("Cache error for post %s: %v", id, err)
	}
	
	// Cache miss, get from database
	postPtr, err := s.postService.GetPost(ctx, id)
	if err != nil {
		return nil, err
	}
	
	// Cache the result
	if err := s.cache.Set(ctx, cacheKey, postPtr, cache.MediumDuration); err != nil {
		log.Printf("Failed to cache post %s: %v", id, err)
	}
	
	return postPtr, nil
}

// GetPosts retrieves posts with caching and improved pagination
func (s *CachedPostService) GetPosts(ctx context.Context, filters models.PostFilters) (*models.PostListResponse, error) {
	cacheKey := s.keyBuilder.PostsListKey(filters.Category, filters.Limit, filters.Offset)
	
	// Try cache first
	var response models.PostListResponse
	err := s.cache.Get(ctx, cacheKey, &response)
	if err == nil {
		return &response, nil
	}
	
	if err != cache.ErrCacheMiss {
		log.Printf("Cache error for posts list: %v", err)
	}
	
	// Cache miss, get from database
	responsePtr, err := s.postService.ListPosts(ctx, filters)
	if err != nil {
		return nil, err
	}
	
	// Cache the result for shorter duration since posts change frequently
	if err := s.cache.Set(ctx, cacheKey, responsePtr, cache.ShortDuration); err != nil {
		log.Printf("Failed to cache posts list: %v", err)
	}
	
	return responsePtr, nil
}

// GetUserPosts retrieves user posts with caching
func (s *CachedPostService) GetUserPosts(ctx context.Context, userID string, limit, offset int) ([]*models.Post, error) {
	cacheKey := s.keyBuilder.UserPostsKey(userID, limit, offset)
	
	// Try cache first
	var posts []*models.Post
	err := s.cache.Get(ctx, cacheKey, &posts)
	if err == nil {
		return posts, nil
	}
	
	if err != cache.ErrCacheMiss {
		log.Printf("Cache error for user posts %s: %v", userID, err)
	}
	
	// Cache miss, get from database
	filters := models.PostFilters{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	}
	response, err := s.postService.ListPosts(ctx, filters)
	if err != nil {
		return nil, err
	}
	posts = response.Posts
	
	// Cache the result
	if err := s.cache.Set(ctx, cacheKey, posts, cache.MediumDuration); err != nil {
		log.Printf("Failed to cache user posts %s: %v", userID, err)
	}
	
	return posts, nil
}

// CreatePost creates a post and invalidates relevant caches
func (s *CachedPostService) CreatePost(ctx context.Context, userID string, input models.CreatePostInput) (*models.Post, error) {
	post, err := s.postService.CreatePost(ctx, userID, input)
	if err != nil {
		return nil, err
	}
	
	// Invalidate related caches
	s.invalidatePostCaches(ctx, userID, input.Category)
	
	return post, nil
}

// UpdatePost updates a post and invalidates caches
func (s *CachedPostService) UpdatePost(ctx context.Context, userID, postID string, input models.UpdatePostInput) (*models.Post, error) {
	post, err := s.postService.UpdatePost(ctx, userID, postID, input)
	if err != nil {
		return nil, err
	}
	
	// Invalidate caches
	s.invalidatePostCaches(ctx, post.UserID, post.Category)
	s.cache.Delete(ctx, s.keyBuilder.PostKey(post.ID))
	
	return post, nil
}

// DeletePost deletes a post and invalidates caches
func (s *CachedPostService) DeletePost(ctx context.Context, userID, postID string) error {
	// Get post to know category before deletion
	post, err := s.GetPost(ctx, postID)
	if err != nil {
		return err
	}
	
	err = s.postService.DeletePost(ctx, userID, postID)
	if err != nil {
		return err
	}
	
	// Invalidate caches
	s.invalidatePostCaches(ctx, userID, post.Category)
	s.cache.Delete(ctx, s.keyBuilder.PostKey(postID))
	
	return nil
}

// invalidatePostCaches invalidates caches related to posts
func (s *CachedPostService) invalidatePostCaches(ctx context.Context, userID, category string) {
	// Invalidate posts lists (all categories and specific category)
	s.cache.DeletePattern(ctx, fmt.Sprintf("posts:*"))
	s.cache.DeletePattern(ctx, fmt.Sprintf("user_posts:%s:*", userID))
}