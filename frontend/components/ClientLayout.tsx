"use client"

import { useEffect } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh`, {
          method: "POST",
          credentials: "include", // ✅ 쿠키 포함
        })

        if (res.ok) {
          const data = await res.json()

          console.log("🔄 Access token 재발급 성공")
        } else {
          console.warn("❌ Refresh 실패. 로그인 페이지로 이동")
          window.location.href = "/"
        }
      } catch (err) {
        console.error("❌ 토큰 재발급 중 오류:", err)
      }
    }

    // 최초 1회
    refreshAccessToken()

    // ⏱️ 14분마다 access token 갱신 시도 (만료 전)
    const interval = setInterval(() => {
      refreshAccessToken()
    }, 14 * 60 * 1000) // 14분 = 14 * 60 * 1000

    // 🔚 컴포넌트 언마운트 시 interval 제거
    return () => clearInterval(interval)
  }, [])

  return <>{children}</>
}
