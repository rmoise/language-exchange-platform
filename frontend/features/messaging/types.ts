export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isOnline?: boolean;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  other_user?: User;
  last_message?: Message | string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  sender?: User;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
}

export interface UpdateMessageStatusRequest {
  status: MessageStatus;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateConversationRequest {
  participant_id: string;
}

// WebSocket message types
export enum WSMessageType {
  NEW_MESSAGE = 'new_message',
  MESSAGE_READ = 'message_read',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline'
}

export interface WebSocketMessage {
  type: WSMessageType;
  data: any;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface OnlineStatus {
  user_id: string;
  is_online: boolean;
}

// Translation types
export interface TranslateRequest {
  text: string;
  source_lang: string;
  target_lang: string;
}

export interface TranslateResponse {
  original_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  provider: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
}

export interface LanguagesResponse {
  languages: SupportedLanguage[];
}

export interface TranslationError {
  code: string;
  message: string;
  details?: string;
}

export interface MessageTranslation {
  messageId: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isLoading: boolean;
  error?: string;
}

// Translation cache entry
export interface TranslationCacheEntry {
  key: string; // messageId:sourceLang:targetLang
  translation: TranslateResponse;
  timestamp: number;
}