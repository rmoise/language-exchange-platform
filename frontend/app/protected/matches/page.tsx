import { Typography, Box, Container } from '@mui/material'
import { cookies } from 'next/headers'
import MatchList from './MatchList'

async function getMatches() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch matches')
  }
  
  const data = await response.json()
  return data.data || data.matches || []
}

export default async function MatchesPage() {
  let matches = []
  let error = null
  
  try {
    matches = await getMatches()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load matches'
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Language Exchange Matches
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        These are your confirmed language exchange partners. Start conversations and practice together!
      </Typography>
      
      {error ? (
        <Box sx={{ mt: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <MatchList matches={matches} />
      )}
    </Container>
  )
}