"use client"

import { useRouter } from "next/navigation"
import AnonymousOnboarding from "@/components/anonymous-onboarding"

export default function AnonymousPage() {
  const router = useRouter()

  return (
    <AnonymousOnboarding
      onComplete={(userInfo) => {
        // ✅ 유저 등록 후 → /{pk}/chat 으로 이동
        router.push(`/${userInfo.pk}/chat`)
      }}
      onBack={() => {
        // 🔙 로그인으로 돌아가기
        router.push("/")
      }}
    />
  )
}
