import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import SessionRoom from './SessionRoom'

async function getSessionData(sessionId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  try {
    // Get session data and current user in parallel
    const [sessionResponse, userResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
    ])
    
    if (!sessionResponse.ok) {
      if (sessionResponse.status === 404) {
        notFound()
      }
      throw new Error('Failed to fetch session')
    }
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const [sessionData, userData] = await Promise.all([
      sessionResponse.json(),
      userResponse.json()
    ])
    
    return {
      session: sessionData.data,
      currentUser: userData.data || userData.user
    }
  } catch (error) {
    console.error('Failed to fetch session data:', error)
    throw error
  }
}

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params
  
  try {
    const { session, currentUser } = await getSessionData(sessionId)
    
    return (
      <SessionRoom 
        sessionId={sessionId}
        initialSession={session}
        currentUser={currentUser}
      />
    )
  } catch (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0f0f0f',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Session Not Found</h1>
          <p>The session you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }
}