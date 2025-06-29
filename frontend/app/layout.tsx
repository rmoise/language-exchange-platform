import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Language Exchange Platform',
  description: 'Find language partners and practice together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <InitColorSchemeScript 
          attribute="data" 
          defaultMode="light"
          modeStorageKey="mui-color-scheme-mode"
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}