"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReactNode, useEffect, useState } from "react"

export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pk, setPk] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setPk(user.pk?.toString() || "")
      setIsAnonymous(user.isAnonymous === true)
    }
  }, [])

  const isMainChatPage = pathname?.match(/^\/\d+\/chat\/?$/)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {!isMainChatPage && (
        <div className="flex justify-around md:justify-center gap-x-3 gap-y-2 px-4 py-4 flex-wrap bg-white/70 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          {/* 메인 페이지로 */}
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/prologue`)}
            className="bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium px-4 py-1.5 rounded-full shadow-sm w-full sm:w-auto"
          >
            메인 페이지로
          </Button>

          {/* 채팅하기 */}
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat`)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium px-4 py-1.5 rounded-full shadow-sm w-full sm:w-auto"
          >
            채팅하기
          </Button>

          {/* 감정일기 보러가기 */}
          <Button
            size="sm"
            disabled={isAnonymous}
            onClick={!isAnonymous ? () => router.push(`/${pk}/chat/emotion-diary`) : undefined}
            className={`font-medium px-4 py-1.5 rounded-full shadow-sm border w-full sm:w-auto ${
              isAnonymous
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200"
            }`}
          >
            감정일기 보러가기
          </Button>

          {/* 빵 캐릭터 콜렉션 */}
          <Button
            size="sm"
            disabled={isAnonymous}
            onClick={!isAnonymous ? () => router.push(`/${pk}/chat/character-collection`) : undefined}
            className={`font-medium px-4 py-1.5 rounded-full shadow-sm border w-full sm:w-auto ${
              isAnonymous
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200"
            }`}
          >
            빵 캐릭터 콜렉션
          </Button>

          {/* 프로필 관리 */}
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat/profile`)}
            className="bg-lime-100 hover:bg-lime-200 text-lime-800 font-medium px-4 py-1.5 rounded-full shadow-sm w-full sm:w-auto"
          >
            프로필 관리
          </Button>
</div>
      )}

      <main className="flex-1">{children}</main>
    </div>
  )
}
