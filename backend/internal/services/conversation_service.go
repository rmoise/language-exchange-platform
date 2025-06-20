package services

import (
	"context"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type ConversationServiceImpl struct {
	conversationRepo repository.ConversationRepository
	userRepo         repository.UserRepository
	messageRepo      repository.MessageRepository
	matchRepo        repository.MatchRepository
}

func NewConversationService(
	conversationRepo repository.ConversationRepository,
	userRepo repository.UserRepository,
	messageRepo repository.MessageRepository,
	matchRepo repository.MatchRepository,
) ConversationService {
	return &ConversationServiceImpl{
		conversationRepo: conversationRepo,
		userRepo:         userRepo,
		messageRepo:      messageRepo,
		matchRepo:        matchRepo,
	}
}

func (s *ConversationServiceImpl) GetOrCreateConversation(ctx context.Context, user1ID, user2ID string) (*models.Conversation, error) {
	// Validate that both users exist
	user1, err := s.userRepo.GetByID(ctx, user1ID)
	if err != nil {
		return nil, fmt.Errorf("user1 not found: %w", err)
	}
	
	user2, err := s.userRepo.GetByID(ctx, user2ID)
	if err != nil {
		return nil, fmt.Errorf("user2 not found: %w", err)
	}
	
	// Users cannot create conversation with themselves
	if user1ID == user2ID {
		return nil, fmt.Errorf("cannot create conversation with yourself")
	}
	
	// Get or create conversation
	conversation, err := s.conversationRepo.GetOrCreate(ctx, user1ID, user2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get or create conversation: %w", err)
	}
	
	// Set other user information
	if conversation.User1ID == user1ID {
		conversation.OtherUser = user2
	} else {
		conversation.OtherUser = user1
	}
	
	// Get last message
	lastMessage, err := s.messageRepo.GetLastMessage(ctx, conversation.ID)
	if err == nil && lastMessage != nil {
		conversation.LastMessage = lastMessage
	}
	
	// Get unread count
	unreadCount, err := s.conversationRepo.GetUnreadCount(ctx, user1ID, conversation.ID)
	if err == nil {
		conversation.UnreadCount = unreadCount
	}
	
	return conversation, nil
}

func (s *ConversationServiceImpl) GetConversationsByUser(ctx context.Context, userID string, limit, offset int) ([]*models.Conversation, error) {
	// Validate user exists
	_, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	
	// Set default limit if not provided
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100 // Maximum limit
	}
	
	conversations, err := s.conversationRepo.GetByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get conversations: %w", err)
	}
	
	// Enhance each conversation with additional data
	for _, conv := range conversations {
		// Get other user information
		otherUserID := conv.GetOtherUserID(userID)
		otherUser, err := s.userRepo.GetByID(ctx, otherUserID)
		if err == nil {
			conv.OtherUser = otherUser
		}
		
		// Get last message
		lastMessage, err := s.messageRepo.GetLastMessage(ctx, conv.ID)
		if err == nil && lastMessage != nil {
			conv.LastMessage = lastMessage
		}
		
		// Get unread count
		unreadCount, err := s.conversationRepo.GetUnreadCount(ctx, userID, conv.ID)
		if err == nil {
			conv.UnreadCount = unreadCount
		}
	}
	
	return conversations, nil
}

func (s *ConversationServiceImpl) GetConversationByID(ctx context.Context, conversationID, userID string) (*models.Conversation, error) {
	// Get conversation
	conversation, err := s.conversationRepo.GetByID(ctx, conversationID)
	if err != nil {
		return nil, fmt.Errorf("conversation not found: %w", err)
	}
	
	// Verify user is a participant
	if !conversation.IsParticipant(userID) {
		return nil, fmt.Errorf("access denied: user is not a participant in this conversation")
	}
	
	// Get other user information
	otherUserID := conversation.GetOtherUserID(userID)
	otherUser, err := s.userRepo.GetByID(ctx, otherUserID)
	if err == nil {
		conversation.OtherUser = otherUser
	}
	
	// Get last message
	lastMessage, err := s.messageRepo.GetLastMessage(ctx, conversation.ID)
	if err == nil && lastMessage != nil {
		conversation.LastMessage = lastMessage
	}
	
	// Get unread count
	unreadCount, err := s.conversationRepo.GetUnreadCount(ctx, userID, conversation.ID)
	if err == nil {
		conversation.UnreadCount = unreadCount
	}
	
	return conversation, nil
}

func (s *ConversationServiceImpl) StartConversationFromMatch(ctx context.Context, matchID, userID string) (*models.Conversation, error) {
	// Get the match to verify it exists and user is a participant
	match, err := s.matchRepo.GetByID(ctx, matchID)
	if err != nil {
		return nil, fmt.Errorf("match not found: %w", err)
	}
	
	// Verify user is a participant in the match
	if match.User1ID != userID && match.User2ID != userID {
		return nil, fmt.Errorf("access denied: user is not a participant in this match")
	}
	
	// Get the other user's ID
	otherUserID := match.GetOtherUserID(userID)
	
	// Create or get conversation between the matched users
	conversation, err := s.GetOrCreateConversation(ctx, userID, otherUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to create conversation from match: %w", err)
	}
	
	return conversation, nil
}