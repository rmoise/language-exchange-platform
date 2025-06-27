package main

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	// Get database URL from environment or use default
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost/language_exchange?sslmode=disable"
	}

	// Connect to database
	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	fmt.Println("Connected to database successfully")

	// Test the exact query that's failing
	query := `
		SELECT 
			p.id, p.user_id, p.title, p.content, p.category, p.category_emoji, p.asking_for,
			p.comment_count, p.reaction_count, p.cursor_id, p.created_at, p.updated_at,
			u.id as "user.id", u.name as "user.name", u.email as "user.email",
			u.profile_image as "user.profile_image", u.city as "user.city", 
			u.country as "user.country"
		FROM posts p
		JOIN users u ON p.user_id = u.id
		WHERE 1=1
		ORDER BY p.cursor_id DESC
		LIMIT 20
	`

	fmt.Println("\nTesting posts query with user join...")
	rows, err := db.Query(query)
	if err != nil {
		fmt.Printf("✗ Error: %v\n", err)
		
		// Try simpler query
		fmt.Println("\nTrying simpler query without join...")
		simpleQuery := "SELECT id, title FROM posts LIMIT 5"
		rows2, err2 := db.Query(simpleQuery)
		if err2 != nil {
			fmt.Printf("✗ Simple query also failed: %v\n", err2)
		} else {
			defer rows2.Close()
			fmt.Println("✓ Simple query succeeded")
			for rows2.Next() {
				var id, title string
				rows2.Scan(&id, &title)
				fmt.Printf("  Post: %s - %s\n", id, title)
			}
		}
	} else {
		defer rows.Close()
		fmt.Println("✓ Query succeeded")
		count := 0
		for rows.Next() {
			count++
		}
		fmt.Printf("  Found %d posts\n", count)
	}
}