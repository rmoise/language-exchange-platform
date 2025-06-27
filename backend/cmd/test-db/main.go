package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	// Get database URL from environment or use default
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost/language_exchange?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("Connected to database successfully")

	// Check if posts table exists
	var exists bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'posts'
		)
	`).Scan(&exists)
	
	if err != nil {
		log.Fatal("Failed to check if posts table exists:", err)
	}
	
	if exists {
		fmt.Println("✓ Posts table exists")
	} else {
		fmt.Println("✗ Posts table does NOT exist")
	}

	// Check table structure
	if exists {
		rows, err := db.Query(`
			SELECT column_name, data_type, is_nullable
			FROM information_schema.columns
			WHERE table_name = 'posts'
			ORDER BY ordinal_position
		`)
		if err != nil {
			log.Fatal("Failed to get table structure:", err)
		}
		defer rows.Close()

		fmt.Println("\nPosts table structure:")
		for rows.Next() {
			var columnName, dataType, isNullable string
			err := rows.Scan(&columnName, &dataType, &isNullable)
			if err != nil {
				log.Fatal(err)
			}
			fmt.Printf("  - %s: %s (nullable: %s)\n", columnName, dataType, isNullable)
		}
	}

	// Try a simple query
	fmt.Println("\nTrying to select from posts table...")
	rows, err := db.Query("SELECT COUNT(*) FROM posts")
	if err != nil {
		fmt.Printf("✗ Error querying posts table: %v\n", err)
	} else {
		defer rows.Close()
		var count int
		if rows.Next() {
			rows.Scan(&count)
			fmt.Printf("✓ Posts table has %d rows\n", count)
		}
	}
}