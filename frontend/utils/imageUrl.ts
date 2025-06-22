/**
 * Converts a relative image URL to an absolute URL
 * @param url - The image URL (can be relative or absolute)
 * @returns The absolute image URL
 */
export function getAbsoluteImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it's a relative URL starting with /, make it absolute
  if (url.startsWith('/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix
    return baseUrl + url
  }
  
  return url
}

/**
 * Converts an absolute image URL to a relative URL for saving to the backend
 * @param url - The image URL (can be relative or absolute)
 * @returns The relative image URL
 */
export function getRelativeImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  
  // If it's already relative, return as is
  if (url.startsWith('/')) {
    return url
  }
  
  // If it's absolute, extract the relative path
  if (url.includes('://')) {
    const match = url.match(/\/uploads\/.+$/)
    if (match) {
      return match[0]
    }
  }
  
  return url
}