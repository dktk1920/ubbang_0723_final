import './globals.css'
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "WhaT's your Feeling",
  description: 'Created with Ubbang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  )
}
