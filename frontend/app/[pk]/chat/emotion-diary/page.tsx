"use client"

import EmotionDiary from "@/components/emotion-diary"

export default function EmotionDiaryPage() {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null
  const user = userStr ? JSON.parse(userStr) : null


  return <EmotionDiary user={user} />
}
