package services

import (
	"crypto/rand"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"language-exchange/internal/models"
)

type UploadService struct {
	uploadsDir    string
	maxFileSize   int64
	allowedTypes  []string
}

func NewUploadService(uploadsDir string, maxFileSize int64) *UploadService {
	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create uploads directory: %v\n", err)
	}

	return &UploadService{
		uploadsDir:   uploadsDir,
		maxFileSize:  maxFileSize,
		allowedTypes: []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"},
	}
}

func (s *UploadService) ValidateFile(file *multipart.FileHeader) error {
	// Check file size
	if file.Size > s.maxFileSize {
		return &models.AppError{
			Code:    "FILE_TOO_LARGE",
			Message: fmt.Sprintf("File size must be less than %d bytes", s.maxFileSize),
			Status:  400,
		}
	}

	// Check file type
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		// Try to determine from file extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		switch ext {
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".png":
			contentType = "image/png"
		case ".gif":
			contentType = "image/gif"
		case ".webp":
			contentType = "image/webp"
		default:
			return &models.AppError{
				Code:    "INVALID_FILE_TYPE",
				Message: "File type not supported",
				Status:  400,
			}
		}
	}

	allowed := false
	for _, allowedType := range s.allowedTypes {
		if contentType == allowedType {
			allowed = true
			break
		}
	}

	if !allowed {
		return &models.AppError{
			Code:    "INVALID_FILE_TYPE",
			Message: "File type not supported. Allowed types: " + strings.Join(s.allowedTypes, ", "),
			Status:  400,
		}
	}

	return nil
}

func (s *UploadService) SaveFile(file *multipart.FileHeader, userID string, uploadType string) (string, error) {
	// Validate file
	if err := s.ValidateFile(file); err != nil {
		return "", err
	}

	// Generate unique filename
	filename, err := s.generateFilename(file.Filename, userID, uploadType)
	if err != nil {
		return "", err
	}

	// Create full path
	fullPath := filepath.Join(s.uploadsDir, filename)

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", &models.AppError{
			Code:    "FILE_READ_ERROR",
			Message: "Failed to read uploaded file",
			Status:  500,
		}
	}
	defer src.Close()

	// Create destination file
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", &models.AppError{
			Code:    "FILE_SAVE_ERROR",
			Message: "Failed to save file",
			Status:  500,
		}
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, src); err != nil {
		// Clean up partial file
		os.Remove(fullPath)
		return "", &models.AppError{
			Code:    "FILE_SAVE_ERROR",
			Message: "Failed to save file",
			Status:  500,
		}
	}

	// Return relative path for storing in database
	return filename, nil
}

func (s *UploadService) DeleteFile(filename string) error {
	if filename == "" {
		return nil
	}

	fullPath := filepath.Join(s.uploadsDir, filename)
	if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (s *UploadService) generateFilename(originalFilename, userID, uploadType string) (string, error) {
	// Get file extension
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".jpg" // default extension
	}

	// Generate random string
	randomBytes := make([]byte, 16)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}
	randomString := fmt.Sprintf("%x", randomBytes)

	// Create filename: {uploadType}_{userID}_{timestamp}_{random}.{ext}
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s_%s_%d_%s%s", uploadType, userID, timestamp, randomString, ext)

	return filename, nil
}

func (s *UploadService) GetFileURL(filename string) string {
	if filename == "" {
		return ""
	}
	// Return URL path that will be handled by the static file server
	return "/uploads/" + filename
}