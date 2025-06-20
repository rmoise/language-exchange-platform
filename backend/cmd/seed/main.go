package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to database successfully!")

	// Read seed script
	seedScript, err := ioutil.ReadFile("../../scripts/seed_users.sql")
	if err != nil {
		log.Fatalf("Failed to read seed script: %v", err)
	}

	// Check if users already exist
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Fatalf("Failed to check existing users: %v", err)
	}

	if count > 0 {
		fmt.Printf("Found %d existing users. Do you want to continue? (y/N): ", count)
		var response string
		fmt.Scanln(&response)
		if response != "y" && response != "Y" {
			fmt.Println("Seeding cancelled.")
			return
		}
	}

	fmt.Println("Running seed script...")

	// Execute seed script
	_, err = db.Exec(string(seedScript))
	if err != nil {
		log.Fatalf("Failed to execute seed script: %v", err)
	}

	fmt.Println("✅ Database seeded successfully!")

	// Display summary
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Printf("Warning: Failed to get final user count: %v", err)
	} else {
		fmt.Printf("Total users in database: %d\n", count)
	}
}