"use client"

import DiaryCreation from "@/components/diary-creation"
import { useRouter } from "next/navigation"

export default function DiaryCreationPage({ params }: { params: { pk: string } }) {
  const router = useRouter()

  const handleComplete = (entry: any) => {
    // ✅ 일기 생성 완료 후 처리
    console.log("📝 일기 저장됨:", entry)
    // 예: 라우팅 이동
    router.push(`/${params.pk}/chat/emotion-diary`)  // 다시 목록 등으로 이동
  }

  const handleCancel = () => {
    // ✅ 뒤로가기 처리
    router.back()
  }

  return <DiaryCreation onComplete={handleComplete} onCancel={handleCancel} />
}
