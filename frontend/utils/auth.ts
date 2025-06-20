export function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1]
  
  return token || null
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getTokenFromCookies()
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}