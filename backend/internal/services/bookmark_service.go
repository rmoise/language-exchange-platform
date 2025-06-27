package services

import (
	"context"
	"fmt"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type BookmarkService struct {
	bookmarkRepo repository.BookmarkRepository
	postRepo     repository.PostRepository
}

func NewBookmarkService(bookmarkRepo repository.BookmarkRepository, postRepo repository.PostRepository) *BookmarkService {
	return &BookmarkService{
		bookmarkRepo: bookmarkRepo,
		postRepo:     postRepo,
	}
}

// ToggleBookmark toggles a bookmark for a user and post
func (s *BookmarkService) ToggleBookmark(ctx context.Context, userID, postID string) (*models.BookmarkResponse, error) {
	// Verify post exists
	_, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("post not found: %w", err)
	}

	// Toggle bookmark
	isBookmarked, err := s.bookmarkRepo.ToggleBookmark(ctx, userID, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to toggle bookmark: %w", err)
	}

	message := "Post unbookmarked"
	if isBookmarked {
		message = "Post bookmarked"
	}

	return &models.BookmarkResponse{
		PostID:       postID,
		IsBookmarked: isBookmarked,
		Message:      message,
	}, nil
}

// GetUserBookmarks retrieves all bookmarked posts for a user
func (s *BookmarkService) GetUserBookmarks(ctx context.Context, userID string, limit, offset int) ([]models.Post, int, error) {
	// Get bookmarked posts
	posts, err := s.bookmarkRepo.GetUserBookmarks(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get user bookmarks: %w", err)
	}

	// Get total count
	totalCount, err := s.bookmarkRepo.GetUserBookmarkCount(ctx, userID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get bookmark count: %w", err)
	}

	return posts, totalCount, nil
}

// IsBookmarked checks if a user has bookmarked a specific post
func (s *BookmarkService) IsBookmarked(ctx context.Context, userID, postID string) (bool, error) {
	return s.bookmarkRepo.IsBookmarked(ctx, userID, postID)
}

// GetBookmarkStatusForPosts returns bookmark status for multiple posts
func (s *BookmarkService) GetBookmarkStatusForPosts(ctx context.Context, userID string, postIDs []string) (map[string]bool, error) {
	return s.bookmarkRepo.GetPostBookmarkStatus(ctx, userID, postIDs)
}