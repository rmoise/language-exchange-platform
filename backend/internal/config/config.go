package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port                  string
	DatabaseURL           string
	JWTSecret             string
	Environment           string
	GoogleClientID        string
	GoogleClientSecret    string
	GoogleRedirectURL     string
	LibreTranslateURL     string
	LibreTranslateAPIKey  string
	UploadsDir            string
	MaxUploadSize         int64
}

func LoadConfig() (*Config, error) {
	config := &Config{
		Port:                  getEnv("PORT", "8080"),
		DatabaseURL:           getEnv("DATABASE_URL", ""),
		JWTSecret:             getEnv("JWT_SECRET", ""),
		Environment:           getEnv("ENVIRONMENT", "development"),
		GoogleClientID:        getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:    getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:     getEnv("GOOGLE_REDIRECT_URL", "http://localhost:3000/auth/google/callback"),
		LibreTranslateURL:     getEnv("LIBRETRANSLATE_URL", "http://localhost:5000"),
		LibreTranslateAPIKey:  getEnv("LIBRETRANSLATE_API_KEY", ""),
		UploadsDir:            getEnv("UPLOADS_DIR", "./uploads"),
		MaxUploadSize:         getEnvInt64("MAX_UPLOAD_SIZE", 5*1024*1024), // 5MB default
	}

	if config.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	if config.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	if config.GoogleClientID == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_ID is required")
	}

	if config.GoogleClientSecret == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_SECRET is required")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseInt(value, 10, 64); err == nil {
			return parsed
		}
	}
	return defaultValue
}