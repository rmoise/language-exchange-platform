import { Typography, Box, Container } from '@mui/material'
import { cookies } from 'next/headers'
import RequestList from '../RequestList'

async function getOutgoingRequests() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/requests/outgoing`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch outgoing requests')
  }
  
  const data = await response.json()
  return data.data || data.requests || []
}

export default async function OutgoingRequestsPage() {
  let requests = []
  let error = null
  
  try {
    requests = await getOutgoingRequests()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load outgoing requests'
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Outgoing Match Requests
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Match requests you've sent to other users. Track their status here.
      </Typography>
      
      {error ? (
        <Box sx={{ mt: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <RequestList requests={requests} type="outgoing" />
      )}
    </Container>
  )
}