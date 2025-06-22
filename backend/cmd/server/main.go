package main

import (
	"log"

	"language-exchange/internal/config"
	"language-exchange/internal/database"
	"language-exchange/internal/handlers"
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

	// Initialize WebSocket hub
	wsHub := websocket.NewHub()
	go wsHub.Run() // Start the hub in a goroutine

	// Initialize services
	authService := services.NewAuthService(userRepo, tokenService, cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL)
	userService := services.NewUserService(userRepo)
	matchService := services.NewMatchService(matchRepo, userRepo)
	conversationService := services.NewConversationService(conversationRepo, userRepo, messageRepo, matchRepo)
	messageService := services.NewMessageService(messageRepo, conversationRepo, userRepo, wsHub)
	sessionService := services.NewSessionService(sessionRepo, userRepo, matchRepo)
	log.Println("DEBUG: Creating translation service with URL:", cfg.LibreTranslateURL)
	translationService := services.NewTranslationService(cfg.LibreTranslateURL, cfg.LibreTranslateAPIKey)
	log.Println("DEBUG: Creating upload service with dir:", cfg.UploadsDir, "max size:", cfg.MaxUploadSize)
	uploadService := services.NewUploadService(cfg.UploadsDir, cfg.MaxUploadSize)
	
	// Set session service on the hub for database operations
	wsHub.SetSessionService(sessionService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, userService)
	userHandler := handlers.NewUserHandler(userService)
	matchHandler := handlers.NewMatchHandler(matchService)
	conversationHandler := handlers.NewConversationHandler(conversationService)
	messageHandler := handlers.NewMessageHandler(messageService, conversationService)
	sessionHandler := handlers.NewSessionHandler(sessionService, wsHub)
	wsHandler := handlers.NewWebSocketHandler(wsHub, sessionService)
	log.Println("DEBUG: Creating translation handler")
	translationHandler := handlers.NewTranslationHandler(translationService)
	log.Println("DEBUG: Creating upload handler")
	uploadHandler := handlers.NewUploadHandler(uploadService, userService)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(handlers.ErrorHandlingMiddleware())
	router.Use(handlers.CORSMiddleware())

	// Serve static files (uploaded images)
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
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/google", authHandler.GoogleLogin)
			auth.GET("/google/callback", authHandler.GoogleCallback)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(handlers.AuthMiddleware(authService))
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/me", authHandler.GetMe)
				users.PUT("/me/languages", userHandler.UpdateLanguages)
				users.PUT("/me/profile", userHandler.UpdateProfile)
				users.PUT("/me/preferences", userHandler.UpdatePreferences)
				users.PUT("/me/onboarding-step", userHandler.UpdateOnboardingStep)
				users.GET("/:id", userHandler.GetUserByID)
				users.GET("", userHandler.SearchPartners)
			}

			// Match routes
			matches := protected.Group("/matches")
			{
				matches.POST("/requests", matchHandler.SendRequest)
				matches.GET("/requests/incoming", matchHandler.GetIncomingRequests)
				matches.GET("/requests/outgoing", matchHandler.GetOutgoingRequests)
				matches.PUT("/requests/:id", matchHandler.HandleRequest)
				matches.GET("", matchHandler.GetMatches)
				matches.POST("/:matchId/conversation", conversationHandler.StartConversationFromMatch)
			}

			// Conversation routes
			conversations := protected.Group("/conversations")
			{
				conversations.GET("", conversationHandler.GetConversations)
				conversations.POST("", conversationHandler.CreateConversation)
				conversations.GET("/:conversationId", conversationHandler.GetConversation)
				conversations.GET("/:conversationId/messages", messageHandler.GetMessages)
				conversations.POST("/:conversationId/messages", messageHandler.SendMessage)
				conversations.PUT("/:conversationId/messages/read", messageHandler.MarkAsRead)
			}

			// Message routes
			messages := protected.Group("/messages")
			{
				messages.PUT("/:messageId/status", messageHandler.UpdateMessageStatus)
				messages.DELETE("/:messageId", messageHandler.DeleteMessage)
			}

			// Session routes
			sessions := protected.Group("/sessions")
			{
				sessions.POST("", sessionHandler.CreateSession)
				sessions.GET("/active", sessionHandler.GetActiveSessions)
				sessions.GET("/my", sessionHandler.GetUserSessions)
				sessions.GET("/:sessionId", sessionHandler.GetSession)
				sessions.POST("/:sessionId/join", sessionHandler.JoinSession)
				sessions.POST("/:sessionId/leave", sessionHandler.LeaveSession)
				sessions.POST("/:sessionId/end", sessionHandler.EndSession)
				sessions.GET("/:sessionId/participants", sessionHandler.GetSessionParticipants)
				sessions.GET("/:sessionId/messages", sessionHandler.GetSessionMessages)
				sessions.POST("/:sessionId/messages", sessionHandler.SendMessage)
				sessions.GET("/:sessionId/canvas", sessionHandler.GetCanvasOperations)
				sessions.POST("/:sessionId/canvas", sessionHandler.SaveCanvasOperation)
			}

			// Translation routes
			translate := protected.Group("/translate")
			{
				translate.POST("", translationHandler.Translate)
				translate.GET("/languages", translationHandler.GetSupportedLanguages)
				translate.GET("/languages/check", translationHandler.CheckLanguageSupport)
				translate.GET("/health", translationHandler.Health)
				translate.GET("/info", translationHandler.GetServiceInfo)
			}

			// Upload routes
			upload := protected.Group("/upload")
			{
				upload.POST("/image", uploadHandler.UploadImage)
				upload.POST("/images", uploadHandler.UploadMultipleImages)
			}

			// WebSocket routes  
			ws := protected.Group("/ws")
			{
				ws.GET("", wsHandler.HandleWebSocket)
				ws.GET("/online", wsHandler.GetOnlineUsers)
				ws.GET("/online/:userId", wsHandler.CheckUserOnline)
				ws.GET("/sessions/:sessionId/participants", wsHandler.GetSessionParticipants)
			}
		}
		
		// WebSocket session routes with special auth middleware
		wsSession := api.Group("/ws/sessions")
		wsSession.Use(handlers.WebSocketAuthMiddleware(authService))
		{
			wsSession.GET("/:sessionId", wsHandler.HandleSessionWebSocket)
		}
	}

	// Start server
	port := ":" + cfg.Port
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}