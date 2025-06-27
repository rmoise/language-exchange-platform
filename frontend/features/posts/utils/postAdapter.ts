import { Post as ApiPost, Comment as ApiComment, ReactionGroup } from '../services/postService';
import { Post as UIPost, Reply as UIReply } from '@/features/comments/types';
import { formatDistanceToNow } from 'date-fns';

// Helper to get user initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper to get avatar color based on user ID
function getAvatarColor(userId: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'
  ];
  
  // Generate a consistent color based on user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Transform API comment to UI reply format
function transformComment(comment: ApiComment): UIReply {
  return {
    id: comment.id,
    user: {
      id: comment.user?.id,
      name: comment.user?.name || 'Anonymous',
      initials: getInitials(comment.user?.name || 'Anonymous'),
      avatarColor: getAvatarColor(comment.user?.id || comment.id),
      profileImage: comment.user?.profile_image,
    },
    content: comment.content,
    timeAgo: formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }),
    reactions: comment.reactions?.map(r => ({
      emoji: r.emoji,
      count: r.count,
      hasReacted: r.has_reacted,
      users: r.users,
    })) || [],
    parentReplyId: comment.parent_comment_id || null,
    children: comment.children?.map(transformComment) || [],
  };
}

// Transform API post to UI post format
export function transformPost(apiPost: ApiPost): UIPost {
  // Parse content - API returns plain text, but UI expects greeting + paragraphs
  const contentLines = apiPost.content.split('\n\n');
  const greeting = contentLines[0] || '';
  const paragraphs = contentLines.slice(1).filter(p => p.trim());

  return {
    id: apiPost.id,
    user: {
      id: apiPost.user?.id,
      name: apiPost.user?.name || 'Anonymous',
      initials: getInitials(apiPost.user?.name || 'Anonymous'),
      department: getUserLanguageDisplay(apiPost.user),
      timeAgo: formatDistanceToNow(new Date(apiPost.created_at), { addSuffix: true }),
      avatarColor: getAvatarColor(apiPost.user?.id || apiPost.user_id),
      profileImage: apiPost.user?.profileImage || apiPost.user?.profile_image,
    },
    category: {
      emoji: apiPost.category_emoji || getCategoryEmoji(apiPost.category),
      text: apiPost.category,
    },
    title: apiPost.title,
    content: {
      greeting,
      paragraphs: paragraphs, // Don't include the full content if no paragraphs
    },
    stats: {
      bookmarks: 0, // Not implemented in backend yet
    },
    askingFor: apiPost.asking_for || '',
    reactions: apiPost.reactions?.map(r => ({
      emoji: r.emoji,
      count: r.count,
      hasReacted: r.has_reacted,
      users: r.users,
    })) || [],
    replies: apiPost.comments?.map(transformComment) || [],
  };
}

// Helper to get category emoji if not provided
function getCategoryEmoji(category: string): string {
  const categoryEmojis: { [key: string]: string } = {
    'Spanish Learning': '🇪🇸',
    'French Practice': '🇫🇷',
    'Japanese Study': '🇯🇵',
    'English Learning': '🇬🇧',
    'German Learning': '🇩🇪',
    'Italian Learning': '🇮🇹',
    'Korean Study': '🇰🇷',
    'Chinese Learning': '🇨🇳',
    'General Discussion': '💡',
    'Grammar Help': '📝',
    'Vocabulary': '📚',
    'Pronunciation': '🗣️',
    'Conversation': '💬',
    'Writing': '✍️',
  };
  
  return categoryEmojis[category] || '🌐';
}

// Helper to get language flag emoji
function getLanguageFlag(language: string): string {
  const languageFlags: { [key: string]: string } = {
    'English': '🇬🇧',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Portuguese': '🇵🇹',
    'Russian': '🇷🇺',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Chinese': '🇨🇳',
    'Mandarin': '🇨🇳',
    'Arabic': '🇸🇦',
    'Hindi': '🇮🇳',
    'Dutch': '🇳🇱',
    'Polish': '🇵🇱',
    'Turkish': '🇹🇷',
    'Swedish': '🇸🇪',
    'Norwegian': '🇳🇴',
    'Danish': '🇩🇰',
    'Finnish': '🇫🇮',
  };
  
  return languageFlags[language] || '🌐';
}

// Helper to get user language display
function getUserLanguageDisplay(user?: any): string {
  if (!user) return 'Language Learner';
  
  // Debug log to see what data we're getting (uncomment if needed)
  
  const nativeLanguages = user.nativeLanguages || [];
  const targetLanguages = user.targetLanguages || [];
  
  let displayParts = [];
  
  // Add target languages
  if (targetLanguages.length > 0) {
    const firstTarget = targetLanguages[0];
    let targetDisplay = `${getLanguageFlag(firstTarget)} Learning ${firstTarget}`;
    
    if (targetLanguages.length > 1) {
      targetDisplay += ` +${targetLanguages.length - 1}`;
    }
    
    displayParts.push(targetDisplay);
  }
  
  // Add native languages
  if (nativeLanguages.length > 0) {
    const firstNative = nativeLanguages[0];
    let nativeDisplay = `${getLanguageFlag(firstNative)} Native ${firstNative}`;
    
    if (nativeLanguages.length > 1) {
      nativeDisplay += ` +${nativeLanguages.length - 1}`;
    }
    
    displayParts.push(nativeDisplay);
  }
  
  if (displayParts.length > 0) {
    return displayParts.join(' • ');
  }
  
  return '🌐 Language Learner';
}