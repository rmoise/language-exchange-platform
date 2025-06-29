import { api } from '@/utils/api'

export interface ImproveMessageResponse {
  original: string
  improved?: string
  remaining?: number
  is_pro: boolean
  needs_upgrade?: boolean
  preview?: string
  message?: string
  used?: number
  limit?: number
}

export interface AIUsageStats {
  used: number
  limit: number
  remaining: number
  is_pro: boolean
  plan_type: string
}

class AIImprovementService {
  async improveMessage(text: string): Promise<ImproveMessageResponse> {
    try {
      const response = await api.post('/ai/improve', { text })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Return the upgrade prompt data from the 429 response
        return error.response.data
      }
      throw new Error('Failed to improve message')
    }
  }

  async getUsageStats(): Promise<AIUsageStats> {
    const response = await api.get('/ai/usage')
    return response.data
  }
}

export const aiImprovementService = new AIImprovementService()
export default aiImprovementService