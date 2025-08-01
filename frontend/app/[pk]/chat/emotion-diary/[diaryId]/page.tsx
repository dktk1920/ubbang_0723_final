"use client"
import { fetchWithAuth } from "@/lib/api"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import DiaryEntry from "@/components/diary-entry"

export default function DiaryEntryPage() {
  const { pk, diaryId } = useParams() as { pk: string; diaryId: string }
  const [entry, setEntry] = useState<any>(null)

  useEffect(() => {
    const fetchEntry = async () => {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/diary/${diaryId}?pk=${pk}`)
      const data = await res.json()

      setEntry({
        id: data.id,
        pk: data.pk,
//         title: data.title || "",
        content: data.content || "",
        summary: data.summary || "",
        imageUrl: data.image_url || data.imageUrl || "/placeholder.svg",
        date: new Date(data.date),
        emotion_level: Number(data.emotion_level ?? 3), // ✅ 숫자로 변환해서 안전하게 처리
         message: data.message ?? "",
      })
    }

    fetchEntry()
  }, [diaryId, pk])

  if (!entry) return <div className="p-6">로딩 중...</div>


  return <DiaryEntry entry={entry} onBack={() => history.back()} />
}
