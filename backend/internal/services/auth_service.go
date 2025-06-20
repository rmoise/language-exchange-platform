package services

import (
	"context"
	"encoding/json"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"language-exchange/pkg/jwt"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type authService struct {
	userRepo     repository.UserRepository
	tokenService *jwt.TokenService
	oauthConfig  *oauth2.Config
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

func NewAuthService(userRepo repository.UserRepository, tokenService *jwt.TokenService, googleClientID, googleClientSecret, googleRedirectURL string) AuthService {
	oauthConfig := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  googleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &authService{
		userRepo:     userRepo,
		tokenService: tokenService,
		oauthConfig:  oauthConfig,
	}
}

func (s *authService) Register(ctx context.Context, input models.RegisterInput) (*models.User, string, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, input.Email)
	if err == nil && existingUser != nil {
		return nil, "", models.ErrDuplicateEmail
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", models.ErrInternalServer
	}

	// Create user
	user := &models.User{
		Email:           input.Email,
		PasswordHash:    string(hashedPassword),
		Name:            input.Name,
		NativeLanguages: []string{},  // Initialize as empty array
		TargetLanguages: []string{},  // Initialize as empty array
		OnboardingStep:  0,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", models.ErrInternalServer
	}

	// Generate token
	token, err := s.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", models.ErrInternalServer
	}

	return user, token, nil
}

func (s *authService) Login(ctx context.Context, email, password string) (*models.User, string, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		log.Printf("Login service - User not found for email '%s': %v", email, err)
		return nil, "", models.ErrInvalidCredentials
	}

	log.Printf("Login service - Found user: %s, password hash length: %d", user.ID, len(user.PasswordHash))

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		log.Printf("Login service - Password comparison failed for user %s: %v", user.ID, err)
		return nil, "", models.ErrInvalidCredentials
	}

	// Generate token
	token, err := s.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", models.ErrInternalServer
	}

	return user, token, nil
}

func (s *authService) ValidateToken(token string) (*models.User, error) {
	claims, err := s.tokenService.ValidateToken(token)
	if err != nil {
		log.Printf("ValidateToken - JWT validation failed: %v", err)
		return nil, models.ErrInvalidToken
	}

	// Get user to ensure they still exist
	user, err := s.userRepo.GetByID(context.Background(), claims.UserID)
	if err != nil {
		log.Printf("ValidateToken - User not found for ID %s: %v", claims.UserID, err)
		return nil, models.ErrInvalidToken
	}

	return user, nil
}

func (s *authService) GetGoogleAuthURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (s *authService) GoogleAuth(ctx context.Context, code string) (*models.User, string, error) {
	// Exchange code for token
	token, err := s.oauthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, "", fmt.Errorf("failed to exchange code: %w", err)
	}

	// Get user info from Google
	client := s.oauthConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, "", fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("failed to get user info: status %d", resp.StatusCode)
	}

	var googleUser GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, "", fmt.Errorf("failed to decode user info: %w", err)
	}

	// Check if user exists by Google ID
	existingUser, err := s.userRepo.GetByGoogleID(ctx, googleUser.ID)
	if err == nil && existingUser != nil {
		// User exists, generate token and return
		jwtToken, err := s.tokenService.GenerateToken(existingUser.ID, existingUser.Email)
		if err != nil {
			return nil, "", models.ErrInternalServer
		}
		return existingUser, jwtToken, nil
	}

	// Check if user exists by email
	existingUser, err = s.userRepo.GetByEmail(ctx, googleUser.Email)
	if err == nil && existingUser != nil {
		// Link Google account to existing user
		existingUser.GoogleID = &googleUser.ID
		if existingUser.ProfileImage == nil && googleUser.Picture != "" {
			existingUser.ProfileImage = &googleUser.Picture
		}
		
		if err := s.userRepo.Update(ctx, existingUser); err != nil {
			return nil, "", models.ErrInternalServer
		}

		jwtToken, err := s.tokenService.GenerateToken(existingUser.ID, existingUser.Email)
		if err != nil {
			return nil, "", models.ErrInternalServer
		}
		return existingUser, jwtToken, nil
	}

	// Create new user
	user := &models.User{
		Email:           googleUser.Email,
		Name:            googleUser.Name,
		GoogleID:        &googleUser.ID,
		NativeLanguages: []string{},  // Initialize as empty array
		TargetLanguages: []string{},  // Initialize as empty array
		OnboardingStep:  0, // Start onboarding
	}

	if googleUser.Picture != "" {
		user.ProfileImage = &googleUser.Picture
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", models.ErrInternalServer
	}

	// Generate token
	jwtToken, err := s.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", models.ErrInternalServer
	}

	return user, jwtToken, nil
}