"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { getEmotionInfoByLevel } from "@/utils/emotionUtils"

interface DiaryEntryType {
  id: string
  date: Date | string
  title: string
  content: string
  imageUrl: string
  summary: string
  emotion_level: number
  message?: string   // ✅ message 필드 추가
}

interface DiaryEntryProps {
  entry: DiaryEntryType
  onBack: () => void
}

export default function DiaryEntry({ entry, onBack }: DiaryEntryProps) {
  const [showMessage, setShowMessage] = useState(false)

  const emotionInfo = getEmotionInfoByLevel(Number(entry.emotion_level ?? 3))
  const diaryDate = new Date(entry.date)

  const handleClick = () => {
    setShowMessage((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 감정 상태 */}
        <div className={`rounded-lg px-4 py-2 text-center font-semibold ${emotionInfo.color}`}>
          {emotionInfo.emoji} {emotionInfo.label}
        </div>

        {/* 그림일기 카드 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            <img
              src={entry.imageUrl ? `${entry.imageUrl}?t=${Date.now()}` : "/placeholder.svg"}
              alt={entry.title}
              className="w-full max-h-[500px] object-contain rounded-t-lg bg-white"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />

            {/* 요약 */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">{entry.summary}</p>

              {/* 📝 너에게 남기는 말 버튼 */}
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={handleClick}
                >
                  {showMessage ? "닫기" : "📝 너에게 남기는 말"}
                </Button>

                {showMessage && (
                  <div className="mt-4 whitespace-pre-wrap bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-800 shadow-inner">
                    {entry.message || "아직 남겨진 말이 없어요 😢"}
                  </div>
                )}
              </div>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">{entry.title}</h1>
                <Badge className={`${emotionInfo.color} border-0`}>
                  {emotionInfo.emoji} <span className="ml-1">{emotionInfo.label}</span>
                </Badge>
              </div>

              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {diaryDate.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
