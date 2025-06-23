import OnboardingCheck from './OnboardingCheck'
import ProtectedLayoutClient from './ProtectedLayoutClient'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingCheck>
      <ProtectedLayoutClient>
        {children}
      </ProtectedLayoutClient>
    </OnboardingCheck>
  )
}