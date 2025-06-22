import { api } from '@/utils/api'

// Types
export interface LanguageSession {
  id: string
  name: string
  description?: string
  created_by: string
  invited_user_id?: string
  status: 'active' | 'ended'
  max_participants: number
  session_type: 'practice' | 'lesson' | 'conversation'
  target_language?: string
  created_at: string
  ended_at?: string
  updated_at: string
  creator?: {
    id: string
    name: string
    email: string
  }
  invited_user?: {
    id: string
    name: string
    email: string
  }
  participants?: SessionParticipant[]
  participant_count: number
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  joined_at: string
  left_at?: string
  role: 'creator' | 'participant' | 'observer'
  is_active: boolean
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface SessionMessage {
  id: string
  session_id: string
  user_id: string
  message_text: string
  message_type: 'text' | 'system' | 'file' | 'voice'
  timestamp: string
  user?: {
    id: string
    name: string
  }
}

export interface CanvasOperation {
  id: string
  session_id: string
  user_id: string
  operation_type: 'text' | 'draw' | 'erase' | 'clear' | 'move' | 'delete' | 'excalidraw_update' | 'text_update'
  operation_data: any
  sequence_number: number
  timestamp: string
  user?: {
    id: string
    name: string
  }
}

// Input types
export interface CreateSessionInput {
  name: string
  description?: string
  max_participants: number
  session_type: 'practice' | 'lesson' | 'conversation'
  target_language?: string
  invited_user_id: string
}

export interface SendMessageInput {
  message_text: string
  message_type?: 'text' | 'system' | 'file' | 'voice'
}

export interface CanvasOperationInput {
  operation_type: 'text' | 'draw' | 'erase' | 'clear' | 'move' | 'delete' | 'excalidraw_update' | 'text_update'
  operation_data: any
}

// Session Service
export class SessionService {
  // Session management
  static async createSession(input: CreateSessionInput): Promise<LanguageSession> {
    const response = await api.post('/sessions', input)
    return response.data.data
  }

  static async getSession(sessionId: string): Promise<LanguageSession> {
    const response = await api.get(`/sessions/${sessionId}`)
    return response.data.data
  }

  static async getUserSessions(): Promise<LanguageSession[]> {
    const response = await api.get('/sessions/my')
    return response.data.data || []
  }

  static async getActiveSessions(limit: number = 20): Promise<LanguageSession[]> {
    const response = await api.get(`/sessions/active?limit=${limit}`)
    return response.data.data || []
  }

  static async joinSession(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/join`)
  }

  static async leaveSession(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/leave`)
  }

  static async endSession(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/end`)
  }

  // Participants
  static async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const response = await api.get(`/sessions/${sessionId}/participants`)
    return response.data.data
  }

  // Canvas operations
  static async saveCanvasOperation(sessionId: string, operation: CanvasOperationInput): Promise<CanvasOperation> {
    const response = await api.post(`/sessions/${sessionId}/canvas`, operation)
    return response.data.data
  }

  static async getCanvasOperations(sessionId: string, fromSequence: number = 0): Promise<CanvasOperation[]> {
    const response = await api.get(`/sessions/${sessionId}/canvas?offset=${fromSequence}&limit=1000`)
    return response.data.data || []
  }

  static async clearCanvas(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/canvas`, {
      operation_type: 'clear',
      operation_data: { action: 'clear_all' }
    })
  }

  // Messages
  static async sendMessage(sessionId: string, message: SendMessageInput): Promise<SessionMessage> {
    const response = await api.post(`/sessions/${sessionId}/messages`, message)
    return response.data.data
  }

  static async getMessages(sessionId: string, limit: number = 50, offset: number = 0): Promise<SessionMessage[]> {
    const response = await api.get(`/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`)
    return response.data.data || []
  }

  static async getSessionMessages(sessionId: string, limit: number = 50, offset: number = 0): Promise<SessionMessage[]> {
    const response = await api.get(`/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`)
    return response.data.data || []
  }
}

export default SessionService