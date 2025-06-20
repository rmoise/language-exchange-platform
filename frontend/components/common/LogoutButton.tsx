'use client'

import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'
import { logout } from '@/features/auth/authSlice'

export default function LogoutButton() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  return (
    <Button color="inherit" onClick={handleLogout}>
      Logout
    </Button>
  )
}