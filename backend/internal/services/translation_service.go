package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"language-exchange/internal/models"
)


// translationService implements TranslationService
type translationService struct {
	libreTranslateURL string
	apiKey            string
	httpClient        *http.Client
	supportedLanguages map[string]models.SupportedLanguage
}

// NewTranslationService creates a new translation service
func NewTranslationService(libreTranslateURL, apiKey string) TranslationService {
	service := &translationService{
		libreTranslateURL: libreTranslateURL,
		apiKey:           apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		supportedLanguages: make(map[string]models.SupportedLanguage),
	}

	// Initialize with common languages (fallback)
	service.initializeCommonLanguages()

	return service
}

// initializeCommonLanguages sets up a fallback list of common languages
func (s *translationService) initializeCommonLanguages() {
	commonLanguages := []models.SupportedLanguage{
		{Code: "en", Name: "English"},
		{Code: "es", Name: "Spanish"},
		{Code: "fr", Name: "French"},
		{Code: "de", Name: "German"},
		{Code: "it", Name: "Italian"},
		{Code: "pt", Name: "Portuguese"},
		{Code: "ru", Name: "Russian"},
		{Code: "ja", Name: "Japanese"},
		{Code: "ko", Name: "Korean"},
		{Code: "zh", Name: "Chinese"},
		{Code: "ar", Name: "Arabic"},
		{Code: "hi", Name: "Hindi"},
		{Code: "nl", Name: "Dutch"},
		{Code: "sv", Name: "Swedish"},
		{Code: "da", Name: "Danish"},
		{Code: "no", Name: "Norwegian"},
		{Code: "fi", Name: "Finnish"},
		{Code: "pl", Name: "Polish"},
		{Code: "tr", Name: "Turkish"},
		{Code: "he", Name: "Hebrew"},
	}

	for _, lang := range commonLanguages {
		s.supportedLanguages[lang.Code] = lang
	}
}

// Translate performs text translation
func (s *translationService) Translate(ctx context.Context, request models.TranslateRequest) (*models.TranslateResponse, error) {
	// Validate input
	if err := s.validateTranslateRequest(request); err != nil {
		return nil, err
	}

	// Check if source and target languages are the same (skip if source is "auto")
	if request.SourceLang != "auto" && request.SourceLang == request.TargetLang {
		return nil, models.ErrSameLanguage
	}

	// Check if languages are supported (allow "auto" for source language)
	if (request.SourceLang != "auto" && !s.IsLanguageSupported(request.SourceLang)) || !s.IsLanguageSupported(request.TargetLang) {
		return nil, models.ErrUnsupportedLanguage
	}

	// Try LibreTranslate first
	response, err := s.translateWithLibreTranslate(ctx, request)
	if err != nil {
		// Log error but don't fail - could add other providers here
		return nil, fmt.Errorf("translation failed: %w", err)
	}

	return response, nil
}

// translateWithLibreTranslate uses LibreTranslate API for translation
func (s *translationService) translateWithLibreTranslate(ctx context.Context, request models.TranslateRequest) (*models.TranslateResponse, error) {
	if s.libreTranslateURL == "" {
		return nil, models.ErrTranslationServiceUnavailable
	}

	// Prepare LibreTranslate request
	libreRequest := models.LibreTranslateRequest{
		Q:      request.Text,
		Source: request.SourceLang,
		Target: request.TargetLang,
		Format: "text",
	}

	if s.apiKey != "" {
		libreRequest.APIKey = s.apiKey
	}

	// Marshal request to JSON
	requestBody, err := json.Marshal(libreRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	url := fmt.Sprintf("%s/translate", s.libreTranslateURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Make the request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("translation API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var libreResponse models.LibreTranslateResponse
	if err := json.Unmarshal(body, &libreResponse); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Create our response
	translationResponse := &models.TranslateResponse{
		OriginalText:   request.Text,
		TranslatedText: libreResponse.TranslatedText,
		SourceLang:     request.SourceLang,
		TargetLang:     request.TargetLang,
		Provider:       "libretranslate",
	}

	return translationResponse, nil
}

// GetSupportedLanguages returns the list of supported languages
func (s *translationService) GetSupportedLanguages(ctx context.Context) (*models.LanguagesResponse, error) {
	// Try to fetch from LibreTranslate API if available
	if s.libreTranslateURL != "" {
		if languages, err := s.fetchLanguagesFromLibreTranslate(ctx); err == nil {
			return languages, nil
		}
	}

	// Return fallback languages
	var languages []models.SupportedLanguage
	for _, lang := range s.supportedLanguages {
		languages = append(languages, lang)
	}

	return &models.LanguagesResponse{
		Languages: languages,
	}, nil
}

// fetchLanguagesFromLibreTranslate fetches supported languages from LibreTranslate API
func (s *translationService) fetchLanguagesFromLibreTranslate(ctx context.Context) (*models.LanguagesResponse, error) {
	url := fmt.Sprintf("%s/languages", s.libreTranslateURL)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var languages []models.SupportedLanguage
	if err := json.Unmarshal(body, &languages); err != nil {
		return nil, err
	}

	// Update internal cache
	for _, lang := range languages {
		s.supportedLanguages[lang.Code] = lang
	}

	return &models.LanguagesResponse{
		Languages: languages,
	}, nil
}

// IsLanguageSupported checks if a language code is supported
func (s *translationService) IsLanguageSupported(languageCode string) bool {
	// Allow "auto" for automatic language detection
	if languageCode == "auto" {
		return true
	}
	languageCode = strings.ToLower(languageCode)
	_, exists := s.supportedLanguages[languageCode]
	return exists
}

// validateTranslateRequest validates the translation request
func (s *translationService) validateTranslateRequest(request models.TranslateRequest) error {
	// Check text length
	text := strings.TrimSpace(request.Text)
	if len(text) == 0 {
		return models.ErrInvalidTextLength
	}
	if len(text) > 5000 {
		return models.ErrInvalidTextLength
	}

	// Check language codes
	if len(request.SourceLang) < 2 || len(request.TargetLang) < 2 {
		return errors.New("invalid language codes")
	}

	return nil
}

// Configuration helper functions

// GetDefaultLibreTranslateURL returns the default LibreTranslate URL
func GetDefaultLibreTranslateURL() string {
	// Self-hosted LibreTranslate Docker container
	return "http://localhost:5000"
}

// GetLibreTranslateDockerCommand returns the Docker command to run LibreTranslate
func GetLibreTranslateDockerCommand() string {
	return `docker run -ti --rm -p 5000:5000 libretranslate/libretranslate`
}