'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChatInterface from '@/components/chat-interface'

export default function ChatPage() {
  const { pk } = useParams()
  const [userInfo, setUserInfo] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !pk) return

    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user.pk?.toString() === pk) {
          setUserInfo(user)
        }
      } catch (err) {
        console.error("❌ user 파싱 오류:", err)
      }
    }
  }, [mounted, pk])

  if (!mounted || !userInfo) return <div>🔄 불러오는 중...</div>

  return <ChatInterface initialUserInfo={userInfo} />
}
