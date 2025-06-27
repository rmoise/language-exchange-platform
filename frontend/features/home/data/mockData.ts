export const mockPosts = [
  {
    id: "1",
    user: {
      id: "user-maria",
      name: "Maria Garcia",
      initials: "MG",
      department: "Spanish Native",
      timeAgo: "3 hours ago",
      avatarColor: "#e91e63",
      profileImage: "https://i.pravatar.cc/150?img=5",
    },
    category: {
      emoji: "🇪🇸",
      text: "Spanish Learning",
    },
    title: "Need help with subjunctive mood in Spanish",
    content: {
      greeting: "Hi Language Learning Community,",
      paragraphs: [
        "I'm struggling with the subjunctive mood in Spanish. Could someone explain when to use it?",
        "I've been learning Spanish for 6 months and this is the most challenging topic I've encountered so far.",
      ],
    },
    attachment: {
      title: "30 Minute Meetin…",
      url: "https://calendly.com/…",
    },
    stats: {
      bookmarks: 0,
    },
    askingFor: "grammar help",
    reactions: [
      { emoji: "👍", count: 3, hasReacted: false, users: ["Jane Smith", "John Doe", "Sarah Wilson"] },
      { emoji: "❤️", count: 1, hasReacted: false, users: ["Emma Davis"] },
      { emoji: "🚀", count: 2, hasReacted: true, users: ["You", "Michael Brown"] },
    ],
    replies: [
      {
        id: "r1",
        user: {
          id: "user-2",
          name: "Jane Smith",
          initials: "JS",
          avatarColor: "#9c27b0",
          profileImage: "https://i.pravatar.cc/150?img=5",
        },
        content: "Great opportunity! I'd be happy to help. I have experience conducting technical interviews at FAANG companies.",
        timeAgo: "2 hours ago",
        reactions: [
          { emoji: "👍", count: 2, hasReacted: true, users: ["You", "Aaron Schulz"] },
        ],
        parentReplyId: null,
      },
      {
        id: "r2",
        user: {
          id: "user-3",
          name: "John Doe",
          initials: "JD",
          avatarColor: "#ff6b6b",
          profileImage: "https://i.pravatar.cc/150?img=8",
        },
        content: "@Jane Smith That's amazing! Could you share some tips on system design questions?",
        timeAgo: "1 hour ago",
        reactions: [
          { emoji: "🤔", count: 1, hasReacted: false, users: ["Mike Johnson"] },
        ],
        parentReplyId: "r1",
      },
      {
        id: "r3",
        user: {
          id: "user-4",
          name: "Sarah Chen",
          initials: "SC",
          avatarColor: "#4ecdc4",
          profileImage: "https://i.pravatar.cc/150?img=10",
        },
        content: "I'm also interested in this opportunity. I have 5+ years of experience in tech interviews.",
        timeAgo: "45 minutes ago",
        reactions: [],
        parentReplyId: null,
      },
      {
        id: "r4",
        user: {
          id: "user-2",
          name: "Jane Smith",
          initials: "JS",
          avatarColor: "#9c27b0",
          profileImage: "https://i.pravatar.cc/150?img=5",
        },
        content: "@John Doe Sure! System design is all about understanding trade-offs. Focus on scalability, reliability, and maintainability.",
        timeAgo: "30 minutes ago",
        reactions: [
          { emoji: "💯", count: 3, hasReacted: true, users: ["You", "John Doe", "Sarah Chen"] },
        ],
        parentReplyId: "r2",
      },
    ],
  },
  {
    id: "2",
    user: {
      id: "user-5",
      name: "Aaron Schulz",
      initials: "AS",
      department: "Engineering",
      timeAgo: "9 hours ago",
      avatarColor: "#0e3a78",
      profileImage: "https://i.pravatar.cc/150?img=15",
    },
    category: {
      emoji: "🇫🇷",
      text: "French Practice",
    },
    title: "Looking for French conversation partner",
    content: {
      greeting: "Hi Braintrust Community,",
      paragraphs: [
        "I hope you're all doing well! I'm exploring a unique opportunity and would love your advice or feedback on how to approach it effectively.",
        "I'm a Senior Full Stack Engineer managing multiple roles, and I'm considering collaborating with someone to assist me during technical int",
      ],
    },
    stats: {
      bookmarks: 0,
    },
    askingFor: "grammar help",
    reactions: [
      { emoji: "💡", count: 5, hasReacted: false, users: ["Alice Johnson", "Bob Smith", "Charlie Wilson", "David Lee", "Eve Martinez"] },
      { emoji: "👏", count: 2, hasReacted: true, users: ["You", "Frank Thompson"] },
    ],
    replies: [],
  },
  {
    id: "3",
    user: {
      id: "user-6",
      name: "Lucas Harrison",
      initials: "LH",
      department: "Project & Program Management",
      timeAgo: "1 day ago",
      avatarColor: "#22c55e",
      profileImage: "https://i.pravatar.cc/150?img=18",
    },
    category: {
      emoji: "🇯🇵",
      text: "Japanese Study",
    },
    title: "Sharing my Kanji learning resources",
    content: {
      greeting: "Hello, everyone!",
      paragraphs: [
        "I'm looking to connect with someone who lives in the U.S., is a U.S. citizen, and has graduated from university.",
        "I would like to discuss a long-term business partnership with you.",
        "Looking forward to hearing from you.",
        "Warm regards,\nLucas",
      ],
    },
    stats: {
      bookmarks: 0,
    },
    askingFor: "grammar help",
    reactions: [
      { emoji: "🤝", count: 8, hasReacted: false, users: ["Grace Chen", "Henry Davis", "Isabella Garcia", "Jack Wilson", "Kate Miller", "Liam Anderson", "Mia Taylor", "Noah Thomas"] },
      { emoji: "💪", count: 3, hasReacted: false, users: ["Olivia Jackson", "Peter White", "Quinn Harris"] },
    ],
    replies: [],
  },
  {
    id: "4",
    user: {
      name: "Adrian Alejandro Arechiga Lopez",
      initials: "AA",
      department: "Engineering",
      timeAgo: "1 day ago",
      avatarColor: "#8B5CF6",
    },
    category: {
      emoji: "🇩🇪",
      text: "German Grammar",
    },
    title: "German pronunciation tips for beginners",
    content: {
      greeting: "Hi everyone,",
      paragraphs: [
        "I'm a Computer Systems Engineer looking for a training program to gain experience and improve my skills. I have one year of experience with SQL Server, and I'm a fast learner. My English level is intermediate. Thank you very much!",
      ],
    },
    stats: {
      bookmarks: 0,
    },
    askingFor: "grammar help",
    reactions: [
      { emoji: "📚", count: 4, hasReacted: false, users: ["Rachel Lee", "Samuel Kim", "Tina Rodriguez", "Uma Patel"] },
      { emoji: "🎯", count: 1, hasReacted: false, users: ["Victor Chang"] },
      { emoji: "💼", count: 2, hasReacted: true, users: ["You", "William Brown"] },
    ],
    replies: [],
  },
];

export const aboutData = {
  memberCount: 26899,
  rules: [
    {
      id: 1,
      title: "Be welcoming",
      description: "We strive to be a community that welcomes and supports people of all backgrounds and identities. This includes, but is not limited to, members of any race, ethnicity, culture, national origin, color, immigration status, social and economic class, educational level, sex, sexual orientation, gender identity and expression, age, size, family status, political belief, religion, and mental and physical ability.",
    },
  ],
  admins: [
    { name: "Valeria del Callejo", role: "Professional Network Updates" },
    { name: "Slater Meehan", role: "" },
    { name: "Ilona Mohamed", role: "" },
  ],
};

export const trendingTopics = [
  { name: "pronunciation", color: "#e3f2fd", icon: "🗣️" },
  { name: "grammar", color: "#fff3e0", icon: "📝" },
  { name: "vocabulary", color: "#f1f8e9", icon: "📚" },
  { name: "conversation", color: "#f3e5f5", icon: "💬" },
  { name: "languageexchange", color: "#fffde7", icon: "🌍" },
  { name: "studytips", color: "#e0f2f1", icon: "💡" },
  { name: "beginnerhelp", color: "#e8eaf6", icon: "🌱" },
  { name: "nativespeaker", color: "#fff8e1", icon: "🏆" },
  { name: "culturaltips", color: "#e8f5e8", icon: "🎭" },
  { name: "resources", color: "#f3e5f5", icon: "📖" },
];

export const highlightedProfiles = [
  { 
    id: "1",
    name: "María García", 
    location: "Madrid, Spain",
    languages: {
      fluent: { flags: ["🇪🇸", "🇬🇧"], count: 2 },
      learns: { flags: ["🇯🇵"], count: 1 }
    },
    level: "Native",
    description: "Passionate Spanish teacher with 5 years of experience. I love helping beginners feel confident!",
    isOnline: true,
    age: 28,
    gender: "female",
    region: "Europe",
    country: "Spain",
    city: "Madrid",
    languageLevel: "native"
  },
  { 
    id: "2",
    name: "Yuki Tanaka", 
    location: "Tokyo, Japan",
    languages: {
      fluent: { flags: ["🇯🇵", "🇬🇧"], count: 2 },
      learns: { flags: ["🇪🇸", "🇰🇷"], count: 2 }
    },
    level: "Native",
    description: "Japanese language enthusiast. Let's practice daily conversation and learn about culture together!",
    isOnline: true,
    isNew: true,
    age: 25,
    gender: "male",
    region: "Asia",
    country: "Japan",
    city: "Tokyo",
    languageLevel: "fluent"
  },
  { 
    id: "3",
    name: "Jean Dupont", 
    location: "Paris, France",
    languages: {
      fluent: { flags: ["🇫🇷", "🇬🇧", "🇩🇪"], count: 3 },
      learns: { flags: ["🇨🇳"], count: 1 }
    },
    level: "Native",
    description: "French literature lover. I enjoy discussing books, films, and helping with pronunciation.",
    isOnline: false,
    age: 35,
    gender: "male",
    region: "Europe",
    country: "France",
    city: "Paris",
    languageLevel: "advanced"
  },
  { 
    id: "4",
    name: "Sarah Chen", 
    location: "Shanghai, China",
    languages: {
      fluent: { flags: ["🇨🇳", "🇬🇧"], count: 2 },
      learns: { flags: ["🇫🇷", "🇯🇵"], count: 2 }
    },
    level: "Advanced",
    description: "Business Chinese specialist. I can help with HSK preparation and professional vocabulary.",
    isOnline: true,
    age: 30,
    gender: "female",
    region: "Asia",
    country: "China",
    city: "Shanghai",
    languageLevel: "intermediate"
  },
  { 
    id: "5",
    name: "Marco Rossi", 
    location: "Rome, Italy",
    languages: {
      fluent: { flags: ["🇮🇹", "🇬🇧", "🇪🇸"], count: 3 },
      learns: { flags: ["🇩🇪"], count: 1 }
    },
    level: "Native",
    description: "Italian chef and language teacher. Let's talk about food, travel, and Italian culture!",
    isOnline: false,
    age: 40,
    gender: "male",
    region: "Europe",
    country: "Italy",
    city: "Rome",
    languageLevel: "beginner"
  },
  { 
    id: "6",
    name: "Anna Schmidt", 
    location: "Berlin, Germany",
    languages: {
      fluent: { flags: ["🇩🇪", "🇬🇧"], count: 2 },
      learns: { flags: ["🇪🇸", "🇮🇹"], count: 2 }
    },
    level: "Native",
    description: "German language coach focusing on business German and exam preparation.",
    isOnline: true,
    age: 32,
    gender: "female",
    region: "Europe",
    country: "Germany",
    city: "Berlin",
    languageLevel: "native"
  },
];