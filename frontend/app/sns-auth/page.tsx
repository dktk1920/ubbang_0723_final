"use client"

import { useEffect } from "react"

export default function SnsAuthPage() {
  useEffect(() => {
    const goNaverLogin = async () => {
      try {
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/naver/login`
      } catch (error) {
        console.error("네이버 로그인 오류:", error)
      }
    }

    goNaverLogin()
  }, [])

  return <div className="p-4 text-center">네이버 로그인 중입니다...</div>
}
