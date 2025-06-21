package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"strings"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"
	"language-exchange/pkg/validators"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Validate input
	if validationErrors := validators.ValidateRegisterInput(input.Email, input.Password, input.Name); len(validationErrors) > 0 {
		errors.HandleValidationError(c, validationErrors)
		return
	}

	user, token, err := h.authService.Register(c.Request.Context(), input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	response := gin.H{
		"token": token,
		"user":  user,
	}

	errors.SendCreated(c, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	// Debug: Log raw request body
	body, _ := c.GetRawData()
	log.Printf("Raw request body: %s", string(body))

	// Reset the body for binding
	c.Request.Body = io.NopCloser(strings.NewReader(string(body)))

	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("JSON binding error: %v", err)
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Debug: Log the exact input received
	log.Printf("Login attempt - Email: '%s' (length: %d), Password length: %d",
		input.Email, len(input.Email), len(input.Password))

	// Validate input
	if validationErrors := validators.ValidateLoginInput(input.Email, input.Password); len(validationErrors) > 0 {
		log.Printf("Validation errors: %+v", validationErrors)
		errors.HandleValidationError(c, validationErrors)
		return
	}

	user, token, err := h.authService.Login(c.Request.Context(), input.Email, input.Password)
	if err != nil {
		log.Printf("Login failed for email '%s': %v", input.Email, err)
		errors.HandleError(c, err)
		return
	}

	response := gin.H{
		"token": token,
		"user":  user,
	}

	errors.SendSuccess(c, response)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	errors.SendSuccess(c, user)
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	// Generate a random state string
	state := generateRandomState()

	// Store state in session or cookie for verification later
	c.SetCookie("oauth_state", state, 300, "/", "", false, true) // 5 minutes expiry

	// Get Google OAuth URL
	authURL := h.authService.GetGoogleAuthURL(state)

	c.JSON(http.StatusOK, gin.H{
		"authUrl": authURL,
	})
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// Verify state parameter
	expectedState, err := c.Cookie("oauth_state")
	if err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_STATE", "Missing OAuth state")
		return
	}

	receivedState := c.Query("state")
	if receivedState != expectedState {
		errors.SendError(c, http.StatusBadRequest, "INVALID_STATE", "Invalid OAuth state")
		return
	}

	// Clear the state cookie
	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	// Get authorization code
	code := c.Query("code")
	if code == "" {
		errors.SendError(c, http.StatusBadRequest, "MISSING_CODE", "Authorization code is required")
		return
	}

	// Exchange code for user info and create/login user
	user, token, err := h.authService.GoogleAuth(c.Request.Context(), code)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	response := gin.H{
		"token": token,
		"user":  user,
	}

	errors.SendSuccess(c, response)
}

func generateRandomState() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "fallback-state"
	}
	return hex.EncodeToString(bytes)
}