package handlers

import (
	"net/http"

	"language-exchange/internal/models"
	"language-exchange/internal/services"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	uploadService *services.UploadService
	userService   services.UserServiceInterface
}

func NewUploadHandler(uploadService *services.UploadService, userService services.UserServiceInterface) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
		userService:   userService,
	}
}

type UploadImageRequest struct {
	Type string `form:"type" binding:"required"` // "profile", "cover", or "gallery"
}

type UploadImageResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Message  string `json:"message"`
}

func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Get user from context (set by auth middleware)
	userIDInterface, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, ok := userIDInterface.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse form data
	var req UploadImageRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Validate upload type
	if req.Type != "profile" && req.Type != "cover" && req.Type != "gallery" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid upload type. Must be 'profile', 'cover', or 'gallery'"})
		return
	}

	// Get uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	// Save file
	filename, err := h.uploadService.SaveFile(file, userID, req.Type)
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			c.JSON(appErr.Status, gin.H{"error": appErr.Message})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		}
		return
	}

	// Get current user to check for existing profile image
	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		// Don't fail the upload if we can't get user, just proceed
		// The old image won't be cleaned up, but the new one will be saved
	}

	// Update user profile with new image URL
	fileURL := h.uploadService.GetFileURL(filename)
	
	var oldFilename string
	if req.Type == "profile" {
		if user != nil && user.ProfileImage != nil {
			// Extract filename from existing URL to delete old file
			oldFilename = extractFilenameFromURL(*user.ProfileImage)
		}
		
		err = h.userService.UpdateProfileImage(c.Request.Context(), userID, fileURL)
	} else if req.Type == "cover" {
		if user != nil && user.CoverPhoto != nil {
			// Extract filename from existing URL to delete old file
			oldFilename = extractFilenameFromURL(*user.CoverPhoto)
		}
		
		err = h.userService.UpdateCoverPhoto(c.Request.Context(), userID, fileURL)
	} else if req.Type == "gallery" {
		// For gallery photos, append to the Photos array
		err = h.userService.AddPhoto(c.Request.Context(), userID, fileURL)
	}

	if err != nil {
		// If database update fails, clean up the uploaded file
		h.uploadService.DeleteFile(filename)
		
		
		if appErr, ok := err.(*models.AppError); ok {
			c.JSON(appErr.Status, gin.H{"error": appErr.Message})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile: " + err.Error()})
		}
		return
	}

	// Clean up old file if it exists
	if oldFilename != "" {
		h.uploadService.DeleteFile(oldFilename)
	}

	c.JSON(http.StatusOK, UploadImageResponse{
		URL:      fileURL,
		Filename: filename,
		Message:  "Image uploaded successfully",
	})
}

// UploadMultipleImages handles multiple image uploads at once
func (h *UploadHandler) UploadMultipleImages(c *gin.Context) {
	// Get user from context (set by auth middleware)
	userIDInterface, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, ok := userIDInterface.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data"})
		return
	}

	// Get upload type
	uploadType := c.PostForm("type")
	if uploadType != "gallery" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Multiple uploads only supported for gallery"})
		return
	}

	// Get files
	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No images provided"})
		return
	}

	// Limit number of files
	if len(files) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 6 images allowed per upload"})
		return
	}

	var uploadedURLs []string
	var uploadedFilenames []string

	// Process each file
	for _, file := range files {
		// Save file
		filename, err := h.uploadService.SaveFile(file, userID, uploadType)
		if err != nil {
			// Clean up previously uploaded files
			for _, fname := range uploadedFilenames {
				h.uploadService.DeleteFile(fname)
			}
			
			if appErr, ok := err.(*models.AppError); ok {
				c.JSON(appErr.Status, gin.H{"error": appErr.Message})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			}
			return
		}

		fileURL := h.uploadService.GetFileURL(filename)
		uploadedURLs = append(uploadedURLs, fileURL)
		uploadedFilenames = append(uploadedFilenames, filename)

		// Add photo to user's gallery
		err = h.userService.AddPhoto(c.Request.Context(), userID, fileURL)
		if err != nil {
			// Clean up all uploaded files
			for _, fname := range uploadedFilenames {
				h.uploadService.DeleteFile(fname)
			}
			
			if appErr, ok := err.(*models.AppError); ok {
				c.JSON(appErr.Status, gin.H{"error": appErr.Message})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			}
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Images uploaded successfully",
		"urls": uploadedURLs,
		"count": len(uploadedURLs),
	})
}

// Helper function to extract filename from URL
func extractFilenameFromURL(url string) string {
	if url == "" {
		return ""
	}
	// Assuming URL format is "/uploads/filename"
	if len(url) > 9 && url[:9] == "/uploads/" {
		return url[9:]
	}
	return ""
}