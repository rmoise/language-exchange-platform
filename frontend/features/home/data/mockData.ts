export const mockPosts = [
  {
    id: "1",
    user: {
      name: "Aaron Schulz",
      initials: "AS",
      department: "Engineering",
      timeAgo: "9 hours ago",
      avatarColor: "#0e3a78",
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
          name: "Jane Smith",
          initials: "JS",
          avatarColor: "#9c27b0",
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
          name: "John Doe",
          initials: "JD",
          avatarColor: "#ff6b6b",
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
          name: "Sarah Chen",
          initials: "SC",
          avatarColor: "#4ecdc4",
        },
        content: "I'm also interested in this opportunity. I have 5+ years of experience in tech interviews.",
        timeAgo: "45 minutes ago",
        reactions: [],
        parentReplyId: null,
      },
      {
        id: "r4",
        user: {
          name: "Jane Smith",
          initials: "JS",
          avatarColor: "#9c27b0",
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
      name: "Aaron Schulz",
      initials: "AS",
      department: "Engineering",
      timeAgo: "9 hours ago",
      avatarColor: "#0e3a78",
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
      name: "Lucas Harrison",
      initials: "LH",
      department: "Project & Program Management",
      timeAgo: "1 day ago",
      avatarColor: "#22c55e",
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
  { name: "pronunciation", color: "#e3f2fd" },
  { name: "grammar", color: "#fff3e0" },
  { name: "vocabulary", color: "#f1f8e9" },
  { name: "conversation", color: "#f3e5f5" },
  { name: "languageexchange", color: "#fffde7" },
  { name: "studytips", color: "#e0f2f1" },
  { name: "beginnerhelp", color: "#e8eaf6" },
  { name: "nativespeaker", color: "#fff8e1" },
  { name: "culturaltips", color: "#e8f5e8" },
  { name: "resources", color: "#f3e5f5" },
];