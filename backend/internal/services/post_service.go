package services

import (
	"context"
	"sync"
	"time"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type PostService interface {
	CreatePost(ctx context.Context, userID string, input models.CreatePostInput) (*models.Post, error)
	GetPost(ctx context.Context, postID string) (*models.Post, error)
	UpdatePost(ctx context.Context, userID, postID string, input models.UpdatePostInput) (*models.Post, error)
	DeletePost(ctx context.Context, userID, postID string) error
	ListPosts(ctx context.Context, filters models.PostFilters) (*models.PostListResponse, error)
	
	// Comments
	AddComment(ctx context.Context, userID string, input models.CreateCommentInput) (*models.Comment, error)
	GetComments(ctx context.Context, postID string) ([]*models.Comment, error)
	DeleteComment(ctx context.Context, userID, commentID string) error
	
	// Reactions
	ToggleReaction(ctx context.Context, userID, postID string, emoji string) error
	ToggleCommentReaction(ctx context.Context, userID, commentID string, emoji string) error
}

type postService struct {
	postRepo            repository.PostRepository
	commentRepo         repository.CommentRepository
	reactionRepo        repository.ReactionRepository
	userRepo            repository.UserRepository
	gamificationService GamificationService
	
	// Simple in-memory cache (replace with Redis in production)
	cache      *postCache
	cacheMutex sync.RWMutex
}

type postCache struct {
	posts      map[string]*cacheEntry
	trending   *cacheEntry
	categories map[string]*cacheEntry
}

type cacheEntry struct {
	data      interface{}
	expiresAt time.Time
}

func NewPostService(
	postRepo repository.PostRepository,
	commentRepo repository.CommentRepository,
	reactionRepo repository.ReactionRepository,
	userRepo repository.UserRepository,
	gamificationService GamificationService,
) PostService {
	return &postService{
		postRepo:            postRepo,
		commentRepo:         commentRepo,
		reactionRepo:        reactionRepo,
		userRepo:            userRepo,
		gamificationService: gamificationService,
		cache: &postCache{
			posts:      make(map[string]*cacheEntry),
			categories: make(map[string]*cacheEntry),
		},
	}
}

func (s *postService) CreatePost(ctx context.Context, userID string, input models.CreatePostInput) (*models.Post, error) {
	// Validate input
	if err := input.Validate(); err != nil {
		return nil, err
	}

	// Create post
	post := &models.Post{
		UserID:        userID,
		Title:         input.Title,
		Content:       input.Content,
		Category:      input.Category,
		CategoryEmoji: input.CategoryEmoji,
		AskingFor:     input.AskingFor,
	}

	if err := s.postRepo.Create(ctx, post); err != nil {
		return nil, err
	}

	// Get user info
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	post.User = user

	// Invalidate relevant caches
	s.invalidateCache("trending")
	s.invalidateCache("category:" + input.Category)

	// Award XP for creating a post
	if s.gamificationService != nil {
		go func() {
			_ = s.gamificationService.OnPostCreated(context.Background(), userID, post.ID)
		}()
	}

	return post, nil
}

func (s *postService) GetPost(ctx context.Context, postID string) (*models.Post, error) {
	// Check cache first
	if cached := s.getFromCache("post:" + postID); cached != nil {
		if post, ok := cached.(*models.Post); ok {
			return post, nil
		}
	}

	// Get currentUserID from context if available
	currentUserID := ""
	if userID, ok := ctx.Value("userID").(string); ok {
		currentUserID = userID
	}

	// Get from database with all details
	post, err := s.postRepo.GetByIDWithDetails(ctx, postID, currentUserID)
	if err != nil {
		return nil, err
	}

	// Cache for 5 minutes
	s.setCache("post:"+postID, post, 5*time.Minute)

	return post, nil
}

func (s *postService) UpdatePost(ctx context.Context, userID, postID string, input models.UpdatePostInput) (*models.Post, error) {
	// Get existing post to verify ownership
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, err
	}

	if post.UserID != userID {
		return nil, models.ErrUnauthorized
	}

	// Update fields
	if input.Title != nil {
		post.Title = *input.Title
	}
	if input.Content != nil {
		post.Content = *input.Content
	}
	if input.Category != nil {
		oldCategory := post.Category
		post.Category = *input.Category
		// Invalidate old category cache
		s.invalidateCache("category:" + oldCategory)
	}
	if input.CategoryEmoji != nil {
		post.CategoryEmoji = *input.CategoryEmoji
	}
	if input.AskingFor != nil {
		post.AskingFor = *input.AskingFor
	}

	if err := s.postRepo.Update(ctx, post); err != nil {
		return nil, err
	}

	// Invalidate caches
	s.invalidateCache("post:" + postID)
	s.invalidateCache("category:" + post.Category)
	s.invalidateCache("trending")

	return s.GetPost(ctx, postID)
}

func (s *postService) DeletePost(ctx context.Context, userID, postID string) error {
	// Get existing post to verify ownership
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return err
	}

	if post.UserID != userID {
		return models.ErrUnauthorized
	}

	if err := s.postRepo.Delete(ctx, postID); err != nil {
		return err
	}

	// Invalidate caches
	s.invalidateCache("post:" + postID)
	s.invalidateCache("category:" + post.Category)
	s.invalidateCache("trending")

	return nil
}

func (s *postService) ListPosts(ctx context.Context, filters models.PostFilters) (*models.PostListResponse, error) {
	// For trending posts, check cache
	if filters.SortBy == "trending" && filters.CursorID == 0 {
		if cached := s.getFromCache("trending"); cached != nil {
			if response, ok := cached.(*models.PostListResponse); ok {
				return response, nil
			}
		}
	}

	// Get posts from repository
	posts, err := s.postRepo.List(ctx, filters)
	if err != nil {
		return nil, err
	}

	// Build response
	response := &models.PostListResponse{
		Posts:   posts,
		HasMore: len(posts) == filters.Limit,
	}

	// Set next cursor if there are more posts
	if len(posts) > 0 && response.HasMore {
		response.NextCursor = posts[len(posts)-1].CursorID
	}

	// Cache trending posts for 2 minutes
	if filters.SortBy == "trending" && filters.CursorID == 0 {
		s.setCache("trending", response, 2*time.Minute)
	}

	return response, nil
}

func (s *postService) AddComment(ctx context.Context, userID string, input models.CreateCommentInput) (*models.Comment, error) {
	// Validate input
	if err := input.Validate(); err != nil {
		return nil, err
	}

	// Verify post exists
	_, err := s.postRepo.GetByID(ctx, input.PostID)
	if err != nil {
		return nil, err
	}

	// Create comment
	comment := &models.Comment{
		PostID:          input.PostID,
		UserID:          userID,
		ParentCommentID: input.ParentCommentID,
		Content:         input.Content,
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		return nil, err
	}

	// Get user info
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	comment.User = user

	// Invalidate post cache
	s.invalidateCache("post:" + input.PostID)
	s.invalidateCache("comments:" + input.PostID)

	return comment, nil
}

func (s *postService) GetComments(ctx context.Context, postID string) ([]*models.Comment, error) {
	// Check cache
	if cached := s.getFromCache("comments:" + postID); cached != nil {
		if comments, ok := cached.([]*models.Comment); ok {
			return comments, nil
		}
	}

	comments, err := s.commentRepo.GetByPostID(ctx, postID)
	if err != nil {
		return nil, err
	}

	// Build comment tree
	commentMap := make(map[string]*models.Comment)
	rootComments := []*models.Comment{}

	for _, comment := range comments {
		commentMap[comment.ID] = comment
		if comment.ParentCommentID == nil {
			rootComments = append(rootComments, comment)
		}
	}

	// Assign children to parents
	for _, comment := range comments {
		if comment.ParentCommentID != nil {
			if parent, ok := commentMap[*comment.ParentCommentID]; ok {
				parent.Children = append(parent.Children, *comment)
			}
		}
	}

	// Cache for 3 minutes
	s.setCache("comments:"+postID, rootComments, 3*time.Minute)

	return rootComments, nil
}

func (s *postService) DeleteComment(ctx context.Context, userID, commentID string) error {
	// Get comment to verify ownership
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		return err
	}

	if comment.UserID != userID {
		return models.ErrUnauthorized
	}

	if err := s.commentRepo.Delete(ctx, commentID); err != nil {
		return err
	}

	// Invalidate caches
	s.invalidateCache("post:" + comment.PostID)
	s.invalidateCache("comments:" + comment.PostID)

	return nil
}

func (s *postService) ToggleReaction(ctx context.Context, userID, postID string, emoji string) error {
	// Check if reaction already exists
	reactions, err := s.reactionRepo.GetByUserAndPost(ctx, userID, postID)
	if err != nil {
		return err
	}


	// Find existing reaction with same emoji
	for _, r := range reactions {
		if r.Emoji == emoji {
			// Remove reaction
			if err := s.reactionRepo.Delete(ctx, r.ID); err != nil {
				return err
			}
			// Invalidate cache AFTER deletion
			s.invalidateCache("post:" + postID)
			return nil
		}
	}

	// Add new reaction
	reaction := &models.Reaction{
		PostID: &postID,
		UserID: userID,
		Emoji:  emoji,
	}

	if err := s.reactionRepo.Create(ctx, reaction); err != nil {
		return err
	}

	// Invalidate post cache
	s.invalidateCache("post:" + postID)

	return nil
}

func (s *postService) ToggleCommentReaction(ctx context.Context, userID, commentID string, emoji string) error {
	// Check if reaction already exists
	reactions, err := s.reactionRepo.GetByUserAndComment(ctx, userID, commentID)
	if err != nil {
		return err
	}

	// Find existing reaction with same emoji
	for _, r := range reactions {
		if r.Emoji == emoji {
			// Remove reaction
			return s.reactionRepo.Delete(ctx, r.ID)
		}
	}

	// Add new reaction
	reaction := &models.Reaction{
		CommentID: &commentID,
		UserID:    userID,
		Emoji:     emoji,
	}

	if err := s.reactionRepo.Create(ctx, reaction); err != nil {
		return err
	}

	// Get comment to invalidate proper caches
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err == nil {
		s.invalidateCache("post:" + comment.PostID)
		s.invalidateCache("comments:" + comment.PostID)
	}

	return nil
}

// Cache helper methods
func (s *postService) getFromCache(key string) interface{} {
	s.cacheMutex.RLock()
	defer s.cacheMutex.RUnlock()

	if entry, ok := s.cache.posts[key]; ok {
		if time.Now().Before(entry.expiresAt) {
			return entry.data
		}
	}
	return nil
}

func (s *postService) setCache(key string, data interface{}, duration time.Duration) {
	s.cacheMutex.Lock()
	defer s.cacheMutex.Unlock()

	s.cache.posts[key] = &cacheEntry{
		data:      data,
		expiresAt: time.Now().Add(duration),
	}
}

func (s *postService) invalidateCache(key string) {
	s.cacheMutex.Lock()
	defer s.cacheMutex.Unlock()

	delete(s.cache.posts, key)
}