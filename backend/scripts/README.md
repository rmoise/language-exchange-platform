# Database Seeding Scripts

This directory contains scripts to seed the database with sample data for development and testing.

## Sample Users Seed Script

The `seed_users.sql` script creates 10 sample users with diverse language combinations and locations around the world.

### Sample Users Include:
- **Sofia Rodriguez** (Madrid, Spain) - Spanish → English, French
- **Kenji Tanaka** (Tokyo, Japan) - Japanese → English  
- **Emma Laurent** (Paris, France) - French → English, Spanish
- **Marcus Weber** (Berlin, Germany) - German → English
- **Alex Smith** (New York, USA) - English → Spanish, French
- **Ana Silva** (São Paulo, Brazil) - Portuguese → English, Spanish
- **Li Wei** (Shanghai, China) - Mandarin → English
- **Giulia Rossi** (Rome, Italy) - Italian → English, German
- **Dmitri Volkov** (Moscow, Russia) - Russian → English, German
- **Min Jung** (Seoul, South Korea) - Korean → English, Japanese

### Features:
- ✅ Realistic user profiles with bios and interests
- ✅ Geographic diversity with accurate coordinates
- ✅ Language exchange pairs (native ↔ target languages)
- ✅ Complete onboarding status
- ✅ Varied join dates for realistic data

## Running the Seed Script

### Option 1: Using Go Application (Recommended)

```bash
# Navigate to the backend directory
cd backend

# Ensure dependencies are installed
go mod tidy
go get github.com/joho/godotenv

# Run the seeding application
go run cmd/seed/main.go
```

The Go application will:
- Check for existing users and ask for confirmation
- Connect to the database using your .env configuration
- Execute the SQL seed script
- Display a summary of inserted users

### Option 2: Direct SQL Execution

```bash
# Using psql command line tool
psql -U your_username -d your_database -f scripts/seed_users.sql

# Or using PostgreSQL client of your choice
```

## Environment Setup

Make sure your `.env` file contains the correct database connection:

```env
DATABASE_URL=postgres://username:password@localhost/language_exchange
```

## Sample Login Credentials

All seeded users have the same password for testing:
- **Password**: `password123`
- **Email format**: `firstname.lastname@example.com`

Example login:
- Email: `sofia.rodriguez@example.com`
- Password: `password123`

## Data Relationships

The seeded users are designed to create meaningful language exchange opportunities:

1. **Spanish ↔ English**: Sofia (ES→EN) ↔ Alex (EN→ES)
2. **Japanese ↔ English**: Kenji (JP→EN) ↔ Alex (EN→JP via Korean connection)
3. **French ↔ English**: Emma (FR→EN) ↔ Alex (EN→FR)
4. **German ↔ English**: Marcus (DE→EN) ↔ Multiple users learning German

## Testing Scenarios

With this seed data, you can test:

1. **Language Matching**: Users with complementary language pairs
2. **Location Filtering**: Users in different cities/countries
3. **Distance Calculations**: Real coordinates for proximity testing
4. **Interest Overlap**: Common interests for better matching
5. **Profile Completion**: All users have complete profiles
6. **Onboarding Flow**: All users have completed onboarding

## Cleanup

To remove all seeded data:

```sql
-- Remove all users (be careful in production!)
DELETE FROM users WHERE email LIKE '%@example.com';
```

## Notes

- All sample users use `@example.com` domain for easy identification
- Password hashes are generated with bcrypt for security
- Coordinates are real locations for accurate distance testing
- All users have `onboarding_step = 5` (completed)
- Created/updated timestamps are varied for realistic data