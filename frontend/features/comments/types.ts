export interface Reply {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  content: string;
  timeAgo: string;
  reactions?: {
    emoji: string;
    count: number;
    hasReacted: boolean;
    users?: string[];
  }[];
  parentReplyId?: string | null;
  children?: Reply[];
}

export interface Post {
  id: string;
  user: {
    name: string;
    initials: string;
    department: string;
    timeAgo: string;
    avatarColor: string;
  };
  category: {
    emoji: string;
    text: string;
  };
  title: string;
  content: {
    greeting: string;
    paragraphs: string[];
  };
  attachment?: {
    title: string;
    url: string;
  };
  stats: {
    bookmarks: number;
  };
  askingFor: string;
  reactions?: {
    emoji: string;
    count: number;
    hasReacted: boolean;
    users: string[];
  }[];
  replies?: Reply[];
}