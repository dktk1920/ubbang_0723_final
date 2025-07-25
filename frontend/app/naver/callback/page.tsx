// app/naver/callback/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"

function CallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) return

    const exchangeCode = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/naver/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        })

        const result = await response.json()
        console.log("✅ 로그인 결과:", result)

        if (result.success) {
          const user = result.user
          localStorage.setItem("user", JSON.stringify(user))

          const pk = user.pk
          if (!pk) {
            alert("로그인에는 성공했지만 pk가 없습니다.")
            return
          }

          router.push(`/${pk}/chat`)
        } else {
          alert("로그인 실패")
        }
      } catch (err) {
        console.error("로그인 오류", err)
      }
    }

    exchangeCode()
  }, [searchParams])

  return <div className="p-4 text-center">네이버 로그인 처리 중입니다...</div>
}

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">로딩 중...</div>}>
      <CallbackHandler />
    </Suspense>
  )
}
