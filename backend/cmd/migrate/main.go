package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"

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

	// Get all migration files
	migrationDir := "internal/database/migrations"
	files, err := ioutil.ReadDir(migrationDir)
	if err != nil {
		log.Fatal("Failed to read migration directory:", err)
	}

	// Sort files by name (they should be numbered)
	var migrationFiles []string
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".sql" {
			migrationFiles = append(migrationFiles, file.Name())
		}
	}
	sort.Strings(migrationFiles)

	// Run each migration
	for _, filename := range migrationFiles {
		filepath := filepath.Join(migrationDir, filename)
		fmt.Printf("Running migration: %s\n", filename)

		// Read migration file
		content, err := ioutil.ReadFile(filepath)
		if err != nil {
			log.Printf("Failed to read migration file %s: %v", filename, err)
			continue
		}

		// Execute migration
		_, err = db.Exec(string(content))
		if err != nil {
			log.Printf("Failed to execute migration %s: %v", filename, err)
			// Don't stop on error, as some migrations might already be applied
			continue
		}

		fmt.Printf("Successfully applied migration: %s\n", filename)
	}

	fmt.Println("All migrations completed!")
}