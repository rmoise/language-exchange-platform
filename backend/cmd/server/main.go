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
	postRepo := postgres.NewPostRepository(db.DB)
	commentRepo := postgres.NewCommentRepository(db.DB)
	reactionRepo := postgres.NewReactionRepository(db.DB)
	bookmarkRepo := postgres.NewBookmarkRepository(db.DB)
	connectionRepo := postgres.NewConnectionRepository(db.DB)
	profileVisitRepo := postgres.NewProfileVisitRepository(db.DB.DB)
	gamificationRepo := postgres.NewGamificationRepository(db.DB)

	// Initialize WebSocket hub
	wsHub := websocket.NewHub()
	go wsHub.Run() // Start the hub in a goroutine

	// Initialize services
	authService := services.NewAuthService(userRepo, tokenService, cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL)
	userService := services.NewUserService(userRepo)
	gamificationService := services.NewGamificationService(gamificationRepo, userRepo)
	matchService := services.NewMatchService(matchRepo, userRepo, gamificationService)
	conversationService := services.NewConversationService(conversationRepo, userRepo, messageRepo, matchRepo)
	messageService := services.NewMessageService(messageRepo, conversationRepo, userRepo, wsHub)
	sessionService := services.NewSessionService(sessionRepo, userRepo, matchRepo, gamificationService)
	postService := services.NewPostService(postRepo, commentRepo, reactionRepo, userRepo, gamificationService)
	bookmarkService := services.NewBookmarkService(bookmarkRepo, postRepo)
	connectionService := services.NewConnectionService(connectionRepo, userRepo)
	profileVisitService := services.NewProfileVisitService(profileVisitRepo)
	log.Println("DEBUG: Creating translation service with URL:", cfg.LibreTranslateURL)
	translationService := services.NewTranslationService(cfg.LibreTranslateURL, cfg.LibreTranslateAPIKey)
	log.Println("DEBUG: Creating upload service with dir:", cfg.UploadsDir, "max size:", cfg.MaxUploadSize)
	uploadService := services.NewUploadService(cfg.UploadsDir, cfg.MaxUploadSize)
	
	// Set session service on the hub for database operations
	wsHub.SetSessionService(sessionService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, userService)
	userHandler := handlers.NewUserHandler(userService, profileVisitService)
	matchHandler := handlers.NewMatchHandler(matchService)
	conversationHandler := handlers.NewConversationHandler(conversationService)
	messageHandler := handlers.NewMessageHandler(messageService, conversationService, wsHub)
	sessionHandler := handlers.NewSessionHandler(sessionService, wsHub)
	wsHandler := handlers.NewWebSocketHandler(wsHub, sessionService)
	postHandler := handlers.NewPostHandler(postService)
	bookmarkHandler := handlers.NewBookmarkHandler(bookmarkService)
	connectionHandler := handlers.NewConnectionHandler(connectionService)
	profileVisitHandler := handlers.NewProfileVisitHandler(profileVisitService)
	gamificationHandler := handlers.NewGamificationHandler(gamificationService)
	log.Println("DEBUG: Creating translation handler")
	translationHandler := handlers.NewTranslationHandler(translationService)
	log.Println("DEBUG: Creating upload handler")
	uploadHandler := handlers.NewUploadHandler(uploadService, userService)
	aiHandler := handlers.NewAIHandler(db.DB)
	
	// Start rate limit cleanup goroutine
	go handlers.CleanupRateLimits()

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
				matches.DELETE("/requests/:id", matchHandler.CancelRequest)
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

			// Connection routes
			connections := protected.Group("/connections")
			{
				connections.POST("/toggle", connectionHandler.ToggleFollow)
				connections.GET("/following", connectionHandler.GetFollowing)
				connections.GET("/followers", connectionHandler.GetFollowers)
				connections.GET("/status/:userId", connectionHandler.GetConnectionStatus)
				connections.GET("/users/:userId/following", connectionHandler.GetUserFollowing)
				connections.GET("/users/:userId/followers", connectionHandler.GetUserFollowers)
			}

			// Bookmark routes
			bookmarks := protected.Group("/bookmarks")
			{
				bookmarks.POST("", bookmarkHandler.ToggleBookmark)
				bookmarks.GET("", bookmarkHandler.GetUserBookmarks)
				bookmarks.GET("/status/:postId", bookmarkHandler.CheckBookmarkStatus)
			}

			// Profile Visit routes
			profileVisits := protected.Group("/profile-visits")
			{
				profileVisits.POST("", profileVisitHandler.RecordProfileVisit)
				profileVisits.GET("", profileVisitHandler.GetProfileVisits)
				profileVisits.GET("/count", profileVisitHandler.GetRecentVisitorCount)
			}

			// Gamification routes
			gamificationHandler.RegisterRoutes(protected)

			// AI routes
			ai := protected.Group("/ai")
			{
				ai.POST("/improve", aiHandler.ImproveMessage)
				ai.GET("/usage", aiHandler.GetUsageStats)
			}

			// WebSocket routes (except main WebSocket connection)
			wsProtected := protected.Group("/ws")
			{
				wsProtected.GET("/online", wsHandler.GetOnlineUsers)
				wsProtected.GET("/online/:userId", wsHandler.CheckUserOnline)
				wsProtected.GET("/sessions/:sessionId/participants", wsHandler.GetSessionParticipants)
			}
		}
		
		// Main WebSocket route with special auth middleware
		ws := api.Group("/ws")
		ws.Use(handlers.WebSocketAuthMiddleware(authService))
		{
			ws.GET("", wsHandler.HandleWebSocket)
		}
		
		// WebSocket session routes with special auth middleware
		wsSession := api.Group("/ws/sessions")
		wsSession.Use(handlers.WebSocketAuthMiddleware(authService))
		{
			wsSession.GET("/:sessionId", wsHandler.HandleSessionWebSocket)
		}
		
		// Post routes (mixed public/protected, handled internally)
		postHandler.RegisterRoutes(api, handlers.AuthMiddleware(authService), handlers.OptionalAuthMiddleware(authService))
	}

	// Start server
	port := ":" + cfg.Port
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}