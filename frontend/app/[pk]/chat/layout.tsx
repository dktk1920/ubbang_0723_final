"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReactNode, useEffect, useState } from "react"

export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pk, setPk] = useState("")

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setPk(user.pk?.toString() || "")
    }
  }, [])

  // 현재 경로가 정확히 /[pk]/chat 이면 네비게이션을 숨김
  const isMainChatPage = pathname?.match(/^\/\d+\/chat\/?$/)

  return (
    <div>
      {/* ✅ 공통 네비게이션: 메인 채팅 페이지에서는 제외 */}
      {!isMainChatPage && (
        <div className="flex justify-center gap-2 px-4 pb-3 pt-4">
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/prologue`)}
            className="bg-pink-100 hover:bg-amber-200 text-amber-800 border-amber-200"
          >
            메인 페이지로
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat`)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200"
          >
            오늘도 고생했어
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat/emotion-diary`)}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200"
          >
            너를 추억해
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat/character-collection`)}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200"
          >
            나 보러와
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat/profile`)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200"
          >
            이게 너야
          </Button>
        </div>
      )}

      {/* ✅ 본문 영역 */}
      <main>{children}</main>
    </div>
  )
}
