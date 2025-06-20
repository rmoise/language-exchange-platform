package validators

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	uuidRegex  = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors []ValidationError

func (v ValidationErrors) Error() string {
	var messages []string
	for _, err := range v {
		messages = append(messages, fmt.Sprintf("%s: %s", err.Field, err.Message))
	}
	return strings.Join(messages, ", ")
}

func ValidateEmail(email string) *ValidationError {
	if email == "" {
		return &ValidationError{Field: "email", Message: "email is required"}
	}
	if !emailRegex.MatchString(email) {
		return &ValidationError{Field: "email", Message: "email is invalid"}
	}
	return nil
}

func ValidatePassword(password string) *ValidationError {
	if password == "" {
		return &ValidationError{Field: "password", Message: "password is required"}
	}
	if len(password) < 6 {
		return &ValidationError{Field: "password", Message: "password must be at least 6 characters"}
	}
	return nil
}

func ValidateName(name string) *ValidationError {
	if name == "" {
		return &ValidationError{Field: "name", Message: "name is required"}
	}
	if len(strings.TrimSpace(name)) < 2 {
		return &ValidationError{Field: "name", Message: "name must be at least 2 characters"}
	}
	return nil
}

func ValidateUUID(id string) *ValidationError {
	if id == "" {
		return &ValidationError{Field: "id", Message: "id is required"}
	}
	if !uuidRegex.MatchString(id) {
		return &ValidationError{Field: "id", Message: "id must be a valid UUID"}
	}
	return nil
}

func ValidateLanguages(languages []string, fieldName string) *ValidationError {
	if len(languages) == 0 {
		return &ValidationError{Field: fieldName, Message: fmt.Sprintf("%s is required", fieldName)}
	}
	
	// Simple validation for now - in a real app you'd validate against a list of supported languages
	for _, lang := range languages {
		if strings.TrimSpace(lang) == "" {
			return &ValidationError{Field: fieldName, Message: fmt.Sprintf("%s contains empty values", fieldName)}
		}
	}
	
	return nil
}

// ValidateRegisterInput validates user registration input
func ValidateRegisterInput(email, password, name string) ValidationErrors {
	var errors ValidationErrors
	
	if err := ValidateEmail(email); err != nil {
		errors = append(errors, *err)
	}
	
	if err := ValidatePassword(password); err != nil {
		errors = append(errors, *err)
	}
	
	if err := ValidateName(name); err != nil {
		errors = append(errors, *err)
	}
	
	return errors
}

// ValidateLoginInput validates user login input
func ValidateLoginInput(email, password string) ValidationErrors {
	var errors ValidationErrors
	
	if err := ValidateEmail(email); err != nil {
		errors = append(errors, *err)
	}
	
	if password == "" {
		errors = append(errors, ValidationError{Field: "password", Message: "password is required"})
	}
	
	return errors
}

// ValidateLanguageUpdate validates language update input
func ValidateLanguageUpdate(native, target []string) ValidationErrors {
	var errors ValidationErrors
	
	if err := ValidateLanguages(native, "native"); err != nil {
		errors = append(errors, *err)
	}
	
	if err := ValidateLanguages(target, "target"); err != nil {
		errors = append(errors, *err)
	}
	
	return errors
}