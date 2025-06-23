import { Typography, Box, Container, Breadcrumbs, Link as MuiLink, Button } from '@mui/material'
import { cookies } from 'next/headers'
import RequestList from '../RequestList'
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

async function getIncomingRequests() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/requests/incoming`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch incoming requests')
  }
  
  const data = await response.json()
  return data.data || data.requests || []
}

export default async function IncomingRequestsPage() {
  let requests = []
  let error = null
  
  try {
    requests = await getIncomingRequests()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load incoming requests'
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/app/matches" passHref legacyBehavior>
          <MuiLink color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Matches
          </MuiLink>
        </Link>
        <Typography color="text.primary">Incoming Requests</Typography>
      </Breadcrumbs>
      
      {/* Back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Link href="/app/matches" passHref legacyBehavior>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Back to Matches
          </Button>
        </Link>
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Incoming Match Requests
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        People who want to be your language exchange partner. Accept or decline their requests.
      </Typography>
      
      {error ? (
        <Box sx={{ mt: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <RequestList requests={requests} type="incoming" />
      )}
    </Container>
  )
}