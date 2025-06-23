import { Reply } from './types';

export const buildReplyTree = (replies: Reply[]): Reply[] => {
  const replyMap = new Map<string, Reply & { children: Reply[] }>();
  const rootReplies: (Reply & { children: Reply[] })[] = [];

  // First pass: create all reply objects with children array
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, children: [] });
  });

  // Second pass: build the tree structure
  replies.forEach(reply => {
    const currentReply = replyMap.get(reply.id)!;
    if (reply.parentReplyId && replyMap.has(reply.parentReplyId)) {
      const parentReply = replyMap.get(reply.parentReplyId)!;
      parentReply.children.push(currentReply);
    } else {
      rootReplies.push(currentReply);
    }
  });

  return rootReplies;
};

export const formatReactionTooltip = (users: string[]): string => {
  if (users.length === 0) return "";
  if (users.length === 1) return users[0];
  if (users.length === 2) return `${users[0]} and ${users[1]}`;
  if (users.length === 3) return `${users[0]}, ${users[1]}, and ${users[2]}`;
  return `${users[0]}, ${users[1]}, and ${users.length - 2} others`;
};