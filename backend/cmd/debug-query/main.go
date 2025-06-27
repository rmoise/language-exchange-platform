package main

import (
	"fmt"
	"strings"
)

func main() {
	// Simulate the query building
	query := `
		SELECT 
			p.id, p.user_id, p.title, p.content, p.category, p.category_emoji, p.asking_for,
			p.comment_count, p.reaction_count, p.cursor_id, p.created_at, p.updated_at,
			u.id as "user.id", u.name as "user.name", u.email as "user.email",
			u.profile_image as "user.profile_image", u.city as "user.city", 
			u.country as "user.country"
		FROM posts p
		JOIN users u ON p.user_id = u.id
		WHERE 1=1`

	args := []interface{}{}
	argCount := 0

	// Default sorting (what's being used)
	query += " ORDER BY p.cursor_id DESC"

	// Limit
	limit := 20
	argCount++
	query += fmt.Sprintf(" LIMIT $%d", argCount)
	args = append(args, limit)

	fmt.Println("Final query:")
	fmt.Println(strings.TrimSpace(query))
	fmt.Println("\nArguments:", args)
	fmt.Println("Arg count:", argCount)
}