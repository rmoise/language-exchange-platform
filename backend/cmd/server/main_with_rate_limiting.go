package main

import (
	"log"
	"time"

	"language-exchange/internal/config"
	"language-exchange/internal/database"
	"language-exchange/internal/handlers"
	"language-exchange/internal/middleware"
	"language-exchange/internal/repository/postgres"
	"language-exchange/internal/services"
	"language-exchange/internal/websocket"
	"language-exchange/pkg/jwt"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize JWT service
	tokenService := jwt.NewTokenService(cfg.JWTSecret)

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db)
	matchRepo := postgres.NewMatchRepository(db)
	conversationRepo := postgres.NewConversationRepository(db.DB)
	messageRepo := postgres.NewMessageRepository(db.DB)
	sessionRepo := postgres.NewSessionRepository(db)
	
	// Initialize abuse prevention repositories
	requestLogRepo := postgres.NewRequestLogRepository(db.DB)
	userBlockRepo := postgres.NewUserBlockRepository(db.DB)
	notificationThrottleRepo := postgres.NewNotificationThrottleRepository(db.DB)

	// Initialize WebSocket hub
	wsHub := websocket.NewHub()
	go wsHub.Run()

	// Initialize services
	authService := services.NewAuthService(userRepo, tokenService, cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL)
	userService := services.NewUserService(userRepo)
	matchService := services.NewMatchService(matchRepo, userRepo)
	conversationService := services.NewConversationService(conversationRepo, userRepo, messageRepo, matchRepo)
	messageService := services.NewMessageService(messageRepo, conversationRepo, userRepo, wsHub)
	sessionService := services.NewSessionService(sessionRepo, userRepo, matchRepo)
	translationService := services.NewTranslationService(cfg.LibreTranslateURL, cfg.LibreTranslateAPIKey)
	uploadService := services.NewUploadService(cfg.UploadsDir, cfg.MaxUploadSize)
	
	// Initialize abuse prevention service
	abusePreventionService := services.NewAbusePreventionService(
		db.DB,
		requestLogRepo,
		userBlockRepo,
		notificationThrottleRepo,
	)

	// Set session service on the hub
	wsHub.SetSessionService(sessionService)

	// Initialize rate limiters
	ipRateLimiter := middleware.NewRateLimiter(time.Hour)
	userRateLimiter := middleware.NewUserRateLimiter()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, userService)
	userHandler := handlers.NewUserHandler(userService)
	
	// Use the enhanced match handler with abuse prevention
	matchHandler := handlers.NewMatchHandlerWithAbusePrevention(
		matchService,
		abusePreventionService,
		userRateLimiter,
	)
	
	conversationHandler := handlers.NewConversationHandler(conversationService)
	messageHandler := handlers.NewMessageHandler(messageService, conversationService)
	sessionHandler := handlers.NewSessionHandler(sessionService, wsHub)
	wsHandler := handlers.NewWebSocketHandler(wsHub, sessionService)
	translationHandler := handlers.NewTranslationHandler(translationService)
	uploadHandler := handlers.NewUploadHandler(uploadService, userService)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(handlers.ErrorHandlingMiddleware())
	router.Use(handlers.CORSMiddleware())
	
	// Apply global rate limiting (100 requests per minute per IP)
	router.Use(ipRateLimiter.RateLimitMiddleware(100, time.Minute))

	// Serve static files
	router.Static("/uploads", cfg.UploadsDir)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		if err := db.Health(); err != nil {
			c.JSON(500, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// API routes
	api := router.Group("/api")
	
	// Apply stricter rate limiting to auth endpoints (10 requests per minute)
	authGroup := api.Group("/auth")
	authGroup.Use(ipRateLimiter.RateLimitMiddleware(10, time.Minute))
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/google", authHandler.GoogleLogin)
		authGroup.GET("/google/callback", authHandler.GoogleCallback)
		authGroup.POST("/refresh", authHandler.RefreshToken)
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(handlers.AuthMiddleware(authService))
	protected.Use(userRateLimiter.ConnectionRateLimitMiddleware()) // Apply user-specific rate limiting
	{
		// User routes
		protected.GET("/users/me", userHandler.GetProfile)
		protected.PUT("/users/me", userHandler.UpdateProfile)
		protected.PUT("/users/me/languages", userHandler.UpdateLanguages)
		protected.GET("/users", userHandler.SearchPartners)
		protected.GET("/users/:id", userHandler.GetUserByID)
		protected.POST("/users/me/profile-image", uploadHandler.UploadProfileImage)
		protected.POST("/users/me/gallery", uploadHandler.UploadGalleryImages)
		protected.DELETE("/users/me/gallery/:imageId", uploadHandler.DeleteGalleryImage)

		// Match routes with enhanced rate limiting
		matchGroup := protected.Group("/matches")
		matchGroup.Use(ipRateLimiter.RateLimitMiddleware(30, time.Minute)) // 30 match actions per minute
		{
			matchGroup.POST("/requests", matchHandler.SendRequest)
			matchGroup.DELETE("/requests/:id", matchHandler.CancelRequest) // New endpoint
			matchGroup.PUT("/requests/:id", matchHandler.HandleRequest)
			matchGroup.GET("/requests/incoming", matchHandler.GetIncomingRequests)
			matchGroup.GET("/requests/outgoing", matchHandler.GetOutgoingRequests)
			matchGroup.GET("/", matchHandler.GetMatches)
			matchGroup.POST("/:id/conversation", conversationHandler.CreateFromMatch)
		}

		// Report abuse endpoint
		protected.POST("/report", matchHandler.ReportUser)

		// Conversation routes
		conversationGroup := protected.Group("/conversations")
		{
			conversationGroup.GET("/", conversationHandler.GetConversations)
			conversationGroup.GET("/:id", conversationHandler.GetConversation)
			conversationGroup.GET("/:id/messages", messageHandler.GetMessages)
			conversationGroup.POST("/:id/messages", messageHandler.SendMessage)
			conversationGroup.PUT("/:id/messages/:messageId/read", messageHandler.MarkAsRead)
			conversationGroup.POST("/:conversationId/typing", messageHandler.SendTypingIndicator)
		}

		// Session routes
		sessionGroup := protected.Group("/sessions")
		{
			sessionGroup.POST("/", sessionHandler.CreateSession)
			sessionGroup.GET("/active", sessionHandler.GetActiveSessions)
			sessionGroup.GET("/:id", sessionHandler.GetSession)
			sessionGroup.PUT("/:id/status", sessionHandler.UpdateSessionStatus)
			sessionGroup.POST("/:id/end", sessionHandler.EndSession)
			sessionGroup.POST("/:id/feedback", sessionHandler.AddFeedback)
		}

		// Translation routes with rate limiting
		translationGroup := protected.Group("/translate")
		translationGroup.Use(ipRateLimiter.RateLimitMiddleware(50, time.Minute)) // 50 translations per minute
		{
			translationGroup.POST("/", translationHandler.Translate)
			translationGroup.GET("/languages", translationHandler.GetLanguages)
		}

		// WebSocket route (special handling)
		protected.GET("/ws", handlers.WebSocketAuthMiddleware(authService), wsHandler.HandleWebSocket)
	}

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}