'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClientLayout from './ClientLayout'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/sns-auth') ||
    pathname.startsWith('/anonymous')

  if (!mounted) return null // 👈 Hydration mismatch 방지

  return isPublicRoute ? <>{children}</> : <ClientLayout>{children}</ClientLayout>
}
