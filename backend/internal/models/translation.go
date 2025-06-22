package models

// TranslateRequest represents a translation request from the frontend
type TranslateRequest struct {
	Text       string `json:"text" binding:"required" validate:"min=1,max=5000"`
	SourceLang string `json:"source_lang" binding:"required" validate:"min=2,max=5"`
	TargetLang string `json:"target_lang" binding:"required" validate:"min=2,max=5"`
}

// TranslateResponse represents the response from the translation API
type TranslateResponse struct {
	OriginalText   string `json:"original_text"`
	TranslatedText string `json:"translated_text"`
	SourceLang     string `json:"source_lang"`
	TargetLang     string `json:"target_lang"`
	Provider       string `json:"provider"` // "libretranslate", "google", "deepl"
}

// LibreTranslateRequest represents the request format for LibreTranslate API
type LibreTranslateRequest struct {
	Q      string `json:"q"`
	Source string `json:"source"`
	Target string `json:"target"`
	Format string `json:"format"`
	APIKey string `json:"api_key,omitempty"`
}

// LibreTranslateResponse represents the response format from LibreTranslate API
type LibreTranslateResponse struct {
	TranslatedText string `json:"translatedText"`
}

// SupportedLanguage represents a language supported by the translation service
type SupportedLanguage struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// LanguagesResponse represents the response for supported languages
type LanguagesResponse struct {
	Languages []SupportedLanguage `json:"languages"`
}

// TranslationError represents translation-specific errors
type TranslationError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func (e *TranslationError) Error() string {
	return e.Message
}

// Common translation error codes
var (
	ErrUnsupportedLanguage = &TranslationError{
		Code:    "UNSUPPORTED_LANGUAGE",
		Message: "Language not supported",
	}
	ErrTranslationServiceUnavailable = &TranslationError{
		Code:    "SERVICE_UNAVAILABLE",
		Message: "Translation service is currently unavailable",
	}
	ErrInvalidTextLength = &TranslationError{
		Code:    "INVALID_TEXT_LENGTH",
		Message: "Text is too long or empty",
	}
	ErrSameLanguage = &TranslationError{
		Code:    "SAME_LANGUAGE",
		Message: "Source and target languages are the same",
	}
)