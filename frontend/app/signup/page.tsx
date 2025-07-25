"use client"

import { useRouter } from "next/navigation"
import Signup from "@/components/signup"

export default function SignupPage() {
  const router = useRouter()

  return (
    <Signup
      onComplete={(userInfo: { pk: string }) => {
        // ✅ 회원가입 완료 후 → /{pk}/prologue 로 이동
        router.push(`/${userInfo.pk}/prologue`)
      }}
      onBack={() => {
        // 🔙 뒤로가기 → /login 으로 이동
        router.push("/")
      }}
    />
  )
}
