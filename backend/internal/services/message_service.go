package services

import (
	"context"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"language-exchange/internal/websocket"
	"strings"
	"time"

	"github.com/google/uuid"
)

type MessageServiceImpl struct {
	messageRepo      repository.MessageRepository
	conversationRepo repository.ConversationRepository
	userRepo         repository.UserRepository
	wsHub            *websocket.Hub
}

func NewMessageService(
	messageRepo repository.MessageRepository,
	conversationRepo repository.ConversationRepository,
	userRepo repository.UserRepository,
	wsHub *websocket.Hub,
) MessageService {
	return &MessageServiceImpl{
		messageRepo:      messageRepo,
		conversationRepo: conversationRepo,
		userRepo:         userRepo,
		wsHub:            wsHub,
	}
}

func (s *MessageServiceImpl) SendMessage(ctx context.Context, conversationID, senderID string, request models.SendMessageRequest) (*models.Message, error) {
	// Validate conversation exists and user is a participant
	conversation, err := s.conversationRepo.GetByID(ctx, conversationID)
	if err != nil {
		return nil, fmt.Errorf("conversation not found: %w", err)
	}
	
	if !conversation.IsParticipant(senderID) {
		return nil, fmt.Errorf("access denied: user is not a participant in this conversation")
	}
	
	// Validate sender exists
	sender, err := s.userRepo.GetByID(ctx, senderID)
	if err != nil {
		return nil, fmt.Errorf("sender not found: %w", err)
	}
	
	// Validate and sanitize content
	content := strings.TrimSpace(request.Content)
	if len(content) == 0 {
		return nil, fmt.Errorf("message content cannot be empty")
	}
	if len(content) > 1000 {
		return nil, fmt.Errorf("message content too long (max 1000 characters)")
	}
	
	// Set default message type if not provided
	messageType := request.MessageType
	if messageType == "" {
		messageType = models.MessageTypeText
	}
	
	// Validate message type
	if !models.IsValidMessageType(messageType) {
		return nil, fmt.Errorf("invalid message type: %s", messageType)
	}
	
	// Create message
	message := &models.Message{
		ID:             uuid.New().String(),
		ConversationID: conversationID,
		SenderID:       senderID,
		Content:        content,
		MessageType:    messageType,
		Status:         models.MessageStatusSent,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		Sender:         sender,
	}
	
	// Save message to database
	err = s.messageRepo.Create(ctx, message)
	if err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}
	
	// Update conversation's last message timestamp (handled by database trigger)
	
	return message, nil
}

func (s *MessageServiceImpl) GetMessages(ctx context.Context, conversationID, userID string, limit, offset int) ([]*models.Message, error) {
	// Validate conversation exists and user is a participant
	conversation, err := s.conversationRepo.GetByID(ctx, conversationID)
	if err != nil {
		return nil, fmt.Errorf("conversation not found: %w", err)
	}
	
	if !conversation.IsParticipant(userID) {
		return nil, fmt.Errorf("access denied: user is not a participant in this conversation")
	}
	
	// Set default limit if not provided
	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100 // Maximum limit
	}
	
	// Get messages from database
	messages, err := s.messageRepo.GetByConversationID(ctx, conversationID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}
	
	// Automatically mark messages as delivered for the requesting user
	// (This would typically be done when the user opens the conversation)
	go func() {
		for _, msg := range messages {
			if msg.SenderID != userID && msg.Status == models.MessageStatusSent {
				s.messageRepo.UpdateStatus(context.Background(), msg.ID, models.MessageStatusDelivered)
			}
		}
	}()
	
	return messages, nil
}

func (s *MessageServiceImpl) MarkAsRead(ctx context.Context, conversationID, userID string) error {
	// Validate conversation exists and user is a participant
	conversation, err := s.conversationRepo.GetByID(ctx, conversationID)
	if err != nil {
		return fmt.Errorf("conversation not found: %w", err)
	}
	
	if !conversation.IsParticipant(userID) {
		return fmt.Errorf("access denied: user is not a participant in this conversation")
	}
	
	// Mark all messages in the conversation as read for this user
	err = s.messageRepo.MarkAsRead(ctx, conversationID, userID)
	if err != nil {
		return fmt.Errorf("failed to mark messages as read: %w", err)
	}
	
	return nil
}

func (s *MessageServiceImpl) UpdateMessageStatus(ctx context.Context, messageID, userID string, status models.MessageStatus) error {
	// Get the message
	message, err := s.messageRepo.GetByID(ctx, messageID)
	if err != nil {
		return fmt.Errorf("message not found: %w", err)
	}
	
	// Get conversation to verify user is a participant
	conversation, err := s.conversationRepo.GetByID(ctx, message.ConversationID)
	if err != nil {
		return fmt.Errorf("conversation not found: %w", err)
	}
	
	if !conversation.IsParticipant(userID) {
		return fmt.Errorf("access denied: user is not a participant in this conversation")
	}
	
	// Users can only update status of messages they didn't send
	if message.SenderID == userID {
		return fmt.Errorf("cannot update status of your own message")
	}
	
	// Validate status transition
	if !message.CanUpdateStatus(status) {
		return fmt.Errorf("invalid status transition from %s to %s", message.Status, status)
	}
	
	// Validate status
	if !models.IsValidMessageStatus(status) {
		return fmt.Errorf("invalid message status: %s", status)
	}
	
	// Update message status
	err = s.messageRepo.UpdateStatus(ctx, messageID, status)
	if err != nil {
		return fmt.Errorf("failed to update message status: %w", err)
	}
	
	return nil
}

func (s *MessageServiceImpl) DeleteMessage(ctx context.Context, messageID, userID string) error {
	// Get the message to validate ownership and check if it can be deleted
	message, err := s.messageRepo.GetByID(ctx, messageID)
	if err != nil {
		return fmt.Errorf("message not found")
	}
	
	// Check if user owns the message
	if message.SenderID != userID {
		return fmt.Errorf("access denied: can only delete your own messages")
	}
	
	// Check if message is too old to delete (e.g., older than 5 minutes)
	timeSinceCreated := time.Since(message.CreatedAt)
	if timeSinceCreated > 5*time.Minute {
		return fmt.Errorf("message too old to delete")
	}
	
	// Delete the message
	err = s.messageRepo.Delete(ctx, messageID)
	if err != nil {
		return fmt.Errorf("failed to delete message: %w", err)
	}
	
	return nil
}