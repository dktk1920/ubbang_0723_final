"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProfileSettings from "@/components/profile-settings"

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/") // 로그아웃 시 홈 또는 로그인 페이지로 이동
  }


  return <ProfileSettings onLogout={handleLogout} />
}
