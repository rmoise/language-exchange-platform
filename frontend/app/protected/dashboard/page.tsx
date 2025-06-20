import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'

// API fetch functions
async function getDashboardData(token: string) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  
  try {
    const [userRes, matchesRes, conversationsRes, incomingRequestsRes, outgoingRequestsRes, searchUsersRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { headers, cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, { headers, cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations?limit=5`, { headers, cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/requests/incoming`, { headers, cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/requests/outgoing`, { headers, cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=3`, { headers, cache: 'no-store' })
    ])

    const [user, matches, conversations, incomingRequests, outgoingRequests, suggestedUsers] = await Promise.all([
      userRes.ok ? userRes.json() : null,
      matchesRes.ok ? matchesRes.json() : null,
      conversationsRes.ok ? conversationsRes.json() : null,
      incomingRequestsRes.ok ? incomingRequestsRes.json() : null,
      outgoingRequestsRes.ok ? outgoingRequestsRes.json() : null,
      searchUsersRes.ok ? searchUsersRes.json() : null
    ])

    return {
      user: user?.data || user?.user || null,
      matches: matches?.data || matches?.matches || [],
      conversations: conversations?.data || conversations?.conversations || [],
      incomingRequests: incomingRequests?.data || incomingRequests?.requests || [],
      outgoingRequests: outgoingRequests?.data || outgoingRequests?.requests || [],
      suggestedUsers: suggestedUsers?.data || suggestedUsers?.users || []
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return {
      user: null,
      matches: [],
      conversations: [],
      incomingRequests: [],
      outgoingRequests: [],
      suggestedUsers: []
    }
  }
}


export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'white' }}>
        Authentication required
      </div>
    )
  }
  
  const data = await getDashboardData(token)
  
  return <DashboardClient data={data} />
}
