import Link from 'next/link'
import { Typography, Box } from '@mui/material'
import RegisterForm from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
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
      <RegisterForm />
      
      <Box sx={{ mt: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 300 }}>
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            style={{ 
              color: '#6366f1',
              fontWeight: 400,
              textDecoration: 'none',
              borderBottom: '1px solid #6366f1'
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}