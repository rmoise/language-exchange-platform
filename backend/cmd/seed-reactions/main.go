package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var reactions = []string{"👍", "❤️", "😊", "🎉", "🤔", "👏", "🔥", "💡"}

func main() {
	// Get database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/language_exchange?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	ctx := context.Background()
	
	// Get all posts
	rows, err := db.QueryContext(ctx, "SELECT id FROM posts LIMIT 50")
	if err != nil {
		log.Fatal("Failed to query posts:", err)
	}
	defer rows.Close()

	var postIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			log.Fatal("Failed to scan post ID:", err)
		}
		postIDs = append(postIDs, id)
	}

	// Get some users to add reactions
	userRows, err := db.QueryContext(ctx, "SELECT id FROM users LIMIT 10")
	if err != nil {
		log.Fatal("Failed to query users:", err)
	}
	defer userRows.Close()

	var userIDs []string
	for userRows.Next() {
		var id string
		if err := userRows.Scan(&id); err != nil {
			log.Fatal("Failed to scan user ID:", err)
		}
		userIDs = append(userIDs, id)
	}

	if len(userIDs) == 0 {
		log.Fatal("No users found in database")
	}

	// Add random reactions to posts
	rand.Seed(time.Now().UnixNano())
	reactionCount := 0

	for _, postID := range postIDs {
		// Add 0-5 reactions per post
		numReactions := rand.Intn(6)
		
		for i := 0; i < numReactions; i++ {
			// Pick random emoji
			emoji := reactions[rand.Intn(len(reactions))]
			
			// Pick 1-3 random users to react with this emoji
			numUsers := rand.Intn(3) + 1
			usedUsers := make(map[int]bool)
			
			for j := 0; j < numUsers && j < len(userIDs); j++ {
				// Pick a random user that hasn't reacted with this emoji yet
				var userIdx int
				for {
					userIdx = rand.Intn(len(userIDs))
					if !usedUsers[userIdx] {
						usedUsers[userIdx] = true
						break
					}
				}
				
				userID := userIDs[userIdx]
				
				// Check if reaction already exists
				var exists bool
				err := db.QueryRowContext(ctx, 
					"SELECT EXISTS(SELECT 1 FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3)",
					postID, userID, emoji).Scan(&exists)
				if err != nil {
					log.Printf("Failed to check existing reaction: %v", err)
					continue
				}
				
				if !exists {
					// Insert reaction
					_, err = db.ExecContext(ctx,
						"INSERT INTO post_reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)",
						postID, userID, emoji)
					if err != nil {
						log.Printf("Failed to insert reaction: %v", err)
						continue
					}
					reactionCount++
				}
			}
		}
	}

	// Update reaction counts
	_, err = db.ExecContext(ctx, `
		UPDATE posts p
		SET reaction_count = (
			SELECT COUNT(*) 
			FROM post_reactions pr 
			WHERE pr.post_id = p.id
		)
	`)
	if err != nil {
		log.Fatal("Failed to update reaction counts:", err)
	}

	fmt.Printf("Successfully added %d reactions to posts!\n", reactionCount)
}