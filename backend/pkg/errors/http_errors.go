package errors

import (
	"language-exchange/internal/models"
	"language-exchange/pkg/validators"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Error   string                    `json:"error"`
	Code    string                    `json:"code"`
	Details []validators.ValidationError `json:"details,omitempty"`
}

// HandleError handles different types of errors and sends appropriate HTTP responses
func HandleError(c *gin.Context, err error) {
	switch e := err.(type) {
	case *models.AppError:
		c.JSON(e.Status, ErrorResponse{
			Error: e.Message,
			Code:  e.Code,
		})
	case validators.ValidationErrors:
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Validation failed",
			Code:    "VALIDATION_ERROR",
			Details: e,
		})
	default:
		// Log the actual error for debugging
		gin.DefaultErrorWriter.Write([]byte("Internal Server Error: " + err.Error() + "\n"))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Internal server error",
			Code:  "INTERNAL_SERVER_ERROR",
		})
	}
}

// HandleValidationError handles validation errors specifically
func HandleValidationError(c *gin.Context, errors validators.ValidationErrors) {
	c.JSON(http.StatusBadRequest, ErrorResponse{
		Error:   "Validation failed",
		Code:    "VALIDATION_ERROR",
		Details: errors,
	})
}

// SendError sends a custom error response
func SendError(c *gin.Context, status int, code, message string) {
	c.JSON(status, ErrorResponse{
		Error: message,
		Code:  code,
	})
}

// SendSuccess sends a success response with data
func SendSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

// SendCreated sends a 201 created response with data
func SendCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"data": data,
	})
}