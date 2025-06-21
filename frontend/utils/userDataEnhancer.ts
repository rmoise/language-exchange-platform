// Shared utility for enhancing user data with consistent mock data

export const mockLocations = [
  { city: 'New York', country: 'USA' },
  { city: 'London', country: 'UK' },
  { city: 'Paris', country: 'France' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Madrid', country: 'Spain' },
  { city: 'Rome', country: 'Italy' },
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Barcelona', country: 'Spain' },
  { city: 'Munich', country: 'Germany' },
  { city: 'Vienna', country: 'Austria' },
  { city: 'Prague', country: 'Czech Republic' },
  { city: 'Stockholm', country: 'Sweden' },
  { city: 'Copenhagen', country: 'Denmark' },
  { city: 'Oslo', country: 'Norway' },
  { city: 'Helsinki', country: 'Finland' },
  { city: 'Zurich', country: 'Switzerland' },
  { city: 'Brussels', country: 'Belgium' },
  { city: 'Dublin', country: 'Ireland' },
  { city: 'Lisbon', country: 'Portugal' }
]

// Helper function to create consistent random values based on user ID
export function getConsistentRandom(userId: string, seed: number = 0): number {
  let hash = 0
  const str = userId + seed.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647 // Normalize to 0-1 range
}

// Enhanced user data with consistent mock information
export function enhanceUserData(user: any, index?: number): any {
  const locationRandom = getConsistentRandom(user.id, 1)
  const genderRandom = getConsistentRandom(user.id, 2)
  const imageRandom = getConsistentRandom(user.id, 3)
  const onlineRandom = getConsistentRandom(user.id, 4)
  const ageRandom = getConsistentRandom(user.id, 5)
  const timeRandom = getConsistentRandom(user.id, 6)
  const bioRandom = getConsistentRandom(user.id, 7)
  
  // Always use consistent random based on user ID for locations (not index)
  // This ensures the same user has the same location everywhere
  const mockLocation = mockLocations[Math.floor(locationRandom * mockLocations.length)]

  const mockBios = [
    "I love learning languages and meeting new people from different cultures. Let's practice together and help each other improve!",
    "Language enthusiast looking for conversation partners. I enjoy discussing travel, culture, and daily life experiences.",
    "Passionate about languages and cultural exchange. Always excited to learn about different perspectives and traditions.",
    "Friendly language learner seeking conversation practice. I love talking about food, music, movies, and travel adventures.",
    "Looking for language exchange partners to improve my skills while making new friends around the world.",
    "Curious about different cultures and languages. I enjoy meaningful conversations and sharing life experiences."
  ]

  const mockTopics = [
    ["Travel", "Culture", "Food", "Music", "Movies"],
    ["Technology", "Books", "Sports", "Art", "Photography"],
    ["Cooking", "Nature", "History", "Languages", "Education"],
    ["Fitness", "Gaming", "Fashion", "Business", "Science"],
    ["Politics", "Philosophy", "Environment", "Health", "Literature"]
  ]

  const aboutQuestions = {
    whatToTalkAbout: [
      "I enjoy discussing travel experiences, cultural differences, food, and daily life. I'm always curious about how people live in different parts of the world!",
      "I love talking about movies, books, music, and current events. I'm also interested in learning about local customs and traditions.",
      "Technology, science, and innovation fascinate me. I also enjoy conversations about art, history, and personal experiences.",
      "I'm passionate about cooking, fitness, and outdoor activities. I love sharing stories about adventures and life experiences.",
      "Philosophy, literature, and deep conversations about life interest me. I also enjoy lighter topics like entertainment and hobbies."
    ],
    idealPartner: [
      "Someone who is patient, friendly, and genuinely interested in language exchange. I appreciate people who are open-minded and love to share their culture.",
      "A conversation partner who is enthusiastic about learning and teaching. I value kindness, humor, and cultural curiosity.",
      "Someone who enjoys meaningful conversations and is willing to correct my mistakes. I prefer partners who are encouraging and supportive.",
      "A patient and understanding person who shares similar interests. I appreciate partners who are consistent and committed to regular practice.",
      "Someone who is respectful, culturally aware, and enjoys both serious and fun conversations. I value authenticity and genuine connections."
    ],
    learningGoals: [
      "I want to become fluent in my target languages and help others with their language goals too. Practice makes perfect!",
      "My goal is to achieve conversational fluency and gain confidence in speaking. I also want to learn about different cultures.",
      "I aim to improve my grammar, pronunciation, and vocabulary through regular conversation practice with native speakers.",
      "I want to reach an advanced level in my target languages and eventually use them professionally. Cultural understanding is also important to me.",
      "My goal is to communicate naturally and spontaneously in different languages while building lasting friendships with my conversation partners."
    ]
  }

  return {
    ...user,
    // Location data
    city: user.city || mockLocation.city,
    country: user.country || mockLocation.country,
    
    // Profile image
    avatar: user.avatar || `https://randomuser.me/api/portraits/${genderRandom > 0.5 ? 'men' : 'women'}/${Math.floor(imageRandom * 100)}.jpg`,
    
    // Bio and personal info
    bio: user.bio || mockBios[Math.floor(bioRandom * mockBios.length)],
    age: user.age || Math.floor(18 + ageRandom * 40), // Random age between 18-58
    
    // Activity data
    isOnline: onlineRandom > 0.7, // 30% chance of being online
    lastActive: user.updatedAt || new Date(Date.now() - timeRandom * 7 * 24 * 60 * 60 * 1000).toISOString(),
    
    // Topics and interests
    topics: user.topics || mockTopics[Math.floor(getConsistentRandom(user.id, 8) * mockTopics.length)],
    interests: user.interests || mockTopics[Math.floor(getConsistentRandom(user.id, 9) * mockTopics.length)],
    
    // About section for detailed profiles
    about: user.about || {
      whatToTalkAbout: aboutQuestions.whatToTalkAbout[Math.floor(getConsistentRandom(user.id, 10) * aboutQuestions.whatToTalkAbout.length)],
      idealPartner: aboutQuestions.idealPartner[Math.floor(getConsistentRandom(user.id, 11) * aboutQuestions.idealPartner.length)],
      learningGoals: aboutQuestions.learningGoals[Math.floor(getConsistentRandom(user.id, 12) * aboutQuestions.learningGoals.length)]
    }
  }
}

// Calculate match percentage based on language compatibility
export function calculateMatchPercentage(user: any, currentUser: any): number | null {
  if (!currentUser?.nativeLanguages || !currentUser?.targetLanguages) return null
  
  let score = 0
  const maxScore = 100
  
  // Language compatibility (60% of score)
  const hasLanguageMatch = user.nativeLanguages?.some((lang: string) => 
    currentUser.targetLanguages.includes(lang)
  ) && user.targetLanguages?.some((lang: string) => 
    currentUser.nativeLanguages.includes(lang)
  )
  
  if (hasLanguageMatch) score += 60
  
  // Location proximity (20% of score)
  if (user.city === currentUser.city) score += 20
  else if (user.country === currentUser.country) score += 10
  
  // Interest overlap (20% of score) 
  if (user.interests && currentUser.interests) {
    const commonInterests = user.interests.filter((interest: string) =>
      currentUser.interests.includes(interest)
    )
    score += Math.min(20, (commonInterests.length / Math.max(user.interests.length, currentUser.interests.length)) * 20)
  }
  
  // Only return a score if there's actual compatibility (> 0)
  return score > 0 ? Math.round(score) : null
}