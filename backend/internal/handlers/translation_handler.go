package handlers

import (
	"net/http"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type TranslationHandler struct {
	translationService services.TranslationService
}

func NewTranslationHandler(translationService services.TranslationService) *TranslationHandler {
	return &TranslationHandler{
		translationService: translationService,
	}
}

// Translate godoc
// @Summary Translate text
// @Description Translate text from one language to another using LibreTranslate
// @Tags translation
// @Accept json
// @Produce json
// @Param request body models.TranslateRequest true "Translation request"
// @Success 200 {object} models.TranslateResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /translate [post]
func (h *TranslationHandler) Translate(c *gin.Context) {
	// Check if user is authenticated (optional - you might want to allow anonymous translation)
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Parse request body
	var request models.TranslateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request body: "+err.Error())
		return
	}

	// Validate request
	if request.Text == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Text is required")
		return
	}

	if len(request.Text) > 5000 {
		errors.SendError(c, http.StatusBadRequest, "TEXT_TOO_LONG", "Text exceeds maximum length of 5000 characters")
		return
	}

	if request.TargetLang == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Target language is required")
		return
	}
	
	// Allow empty source language to default to "auto"
	if request.SourceLang == "" {
		request.SourceLang = "auto"
	}

	// Perform translation
	response, err := h.translationService.Translate(c.Request.Context(), request)
	if err != nil {
		// Handle specific translation errors
		if translationErr, ok := err.(*models.TranslationError); ok {
			switch translationErr.Code {
			case "UNSUPPORTED_LANGUAGE":
				errors.SendError(c, http.StatusBadRequest, translationErr.Code, translationErr.Message)
			case "SAME_LANGUAGE":
				errors.SendError(c, http.StatusBadRequest, translationErr.Code, translationErr.Message)
			case "INVALID_TEXT_LENGTH":
				errors.SendError(c, http.StatusBadRequest, translationErr.Code, translationErr.Message)
			case "SERVICE_UNAVAILABLE":
				errors.SendError(c, http.StatusServiceUnavailable, translationErr.Code, translationErr.Message)
			default:
				errors.SendError(c, http.StatusInternalServerError, "TRANSLATION_ERROR", translationErr.Message)
			}
			return
		}

		// Generic error
		errors.SendError(c, http.StatusInternalServerError, "TRANSLATION_FAILED", "Failed to translate text: "+err.Error())
		return
	}

	// Log successful translation (optional)
	// You might want to log this for analytics or debugging
	// log.Printf("User %v translated text from %s to %s", userID, request.SourceLang, request.TargetLang)

	errors.SendSuccess(c, response)
}

// GetSupportedLanguages godoc
// @Summary Get supported languages
// @Description Get list of languages supported by the translation service
// @Tags translation
// @Accept json
// @Produce json
// @Success 200 {object} models.LanguagesResponse
// @Failure 500 {object} ErrorResponse
// @Router /translate/languages [get]
func (h *TranslationHandler) GetSupportedLanguages(c *gin.Context) {
	// This endpoint doesn't require authentication as it's informational

	response, err := h.translationService.GetSupportedLanguages(c.Request.Context())
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "FETCH_LANGUAGES_FAILED", "Failed to fetch supported languages: "+err.Error())
		return
	}

	errors.SendSuccess(c, response)
}

// CheckLanguageSupport godoc
// @Summary Check if a language is supported
// @Description Check if a specific language code is supported by the translation service
// @Tags translation
// @Accept json
// @Produce json
// @Param lang query string true "Language code to check"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Router /translate/languages/check [get]
func (h *TranslationHandler) CheckLanguageSupport(c *gin.Context) {
	languageCode := c.Query("lang")
	if languageCode == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Language code parameter 'lang' is required")
		return
	}

	isSupported := h.translationService.IsLanguageSupported(languageCode)

	response := map[string]interface{}{
		"language_code": languageCode,
		"supported":     isSupported,
	}

	errors.SendSuccess(c, response)
}

// Health godoc
// @Summary Check translation service health
// @Description Check if the translation service is available and responding
// @Tags translation
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} ErrorResponse
// @Router /translate/health [get]
func (h *TranslationHandler) Health(c *gin.Context) {
	// Try a simple translation to check if the service is working
	testRequest := models.TranslateRequest{
		Text:       "Hello",
		SourceLang: "en",
		TargetLang: "es",
	}

	_, err := h.translationService.Translate(c.Request.Context(), testRequest)
	if err != nil {
		response := map[string]interface{}{
			"status":  "unhealthy",
			"error":   err.Error(),
			"message": "Translation service is not responding",
		}
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}

	response := map[string]interface{}{
		"status":  "healthy",
		"message": "Translation service is working",
	}

	errors.SendSuccess(c, response)
}

// GetServiceInfo godoc
// @Summary Get translation service information
// @Description Get information about the translation service configuration
// @Tags translation
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /translate/info [get]
func (h *TranslationHandler) GetServiceInfo(c *gin.Context) {
	// This endpoint provides basic information about the translation service
	// without exposing sensitive configuration details

	response := map[string]interface{}{
		"provider":        "libretranslate",
		"max_text_length": 5000,
		"description":     "Self-hosted LibreTranslate service with support for premium APIs",
		"features": []string{
			"Multiple language support",
			"Text translation",
			"Language detection (future)",
			"Batch translation (future)",
		},
		"note": "Service supports easy integration with premium APIs like Google Translate or DeepL",
	}

	errors.SendSuccess(c, response)
}