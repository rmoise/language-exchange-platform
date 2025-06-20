import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    redirect('/auth/login')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    redirect('/auth/login')
  }
  
  const data = await response.json()
  return data.data || data.user
}

interface OnboardingCheckProps {
  children: React.ReactNode
}

export default async function OnboardingCheck({ children }: OnboardingCheckProps) {
  const user = await getUser()
  
  // If user hasn't completed onboarding, redirect to onboarding
  if (user.onboardingStep < 5) {
    redirect('/onboarding')
  }
  
  return <>{children}</>
}