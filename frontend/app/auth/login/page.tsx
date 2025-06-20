import Link from 'next/link'
import { Typography, Box } from '@mui/material'
import LoginForm from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
    }}>
      <LoginForm />
      
      <Box sx={{ mt: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 300 }}>
          Don&apos;t have an account?{' '}
          <Link 
            href="/auth/register" 
            style={{ 
              color: '#6366f1',
              fontWeight: 400,
              textDecoration: 'none',
              borderBottom: '1px solid #6366f1'
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}