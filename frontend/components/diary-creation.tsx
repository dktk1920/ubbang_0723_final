"use client"

import { useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sparkles, ImageIcon, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"


interface DiaryEntryType {
  date: string           // "2025-07-17" 형식
  emotion: string
  topic: string
  imageUrl: string
  summary: string
  pk: number
}

interface DiaryCreationProps {
  onComplete: (entry: DiaryEntryType) => void
  onCancel: () => void
}

export default function DiaryCreation({ onComplete, onCancel }: DiaryCreationProps) {
  const router = useRouter()
  const [step, setStep] = useState<"analyzing" | "generating" | "complete">("analyzing")
  const [generatedEntry, setGeneratedEntry] = useState<DiaryEntryType | null>(null)

  const handleAnalyze = async () => {
    setStep("analyzing")

    try {
    const parsed = JSON.parse(localStorage.getItem("user") || "{}")
    const pk = Number(parsed.pk)

    if (!pk) throw new Error("pk 없음")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/diary?pk=${pk}`)

      const data = await res.json()

    const newEntry: DiaryEntryType = {
      date: new Date(),
      emotion: data.emotion,
      topic: data.topic,
      imageUrl: data.image_url,
      summary: data.summary,
      pk
    }

      setGeneratedEntry(newEntry)
      setStep("complete")
    } catch (e) {
      console.error("일기 생성 실패:", e)
      setStep("analyzing")
    }
  }

  const handleComplete = () => {
    if (generatedEntry) {
      onComplete(generatedEntry)
    }
  }

  // 컴포넌트 로드 시 자동 분석 시작
useEffect(() => {
    handleAnalyze()
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">감정 일기 생성</h1>
            <p className="text-gray-600">우빵이가 채팅 내용을 분석해서 일기를 작성 중이에요</p>
          </div>
        </div>

        {step === "analyzing" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">감정을 분석하고 있어요</h3>
              <p className="text-gray-600">잠시만 기다려 주세요...</p>
            </CardContent>
          </Card>
        )}

        {step === "complete" && generatedEntry && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-amber-800">감정 일기가 완성되었어요!</CardTitle>
              <CardDescription className="text-center text-gray-600">아래 내용을 확인해보세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={generatedEntry.imageUrl || "/placeholder.svg"}
                alt={generatedEntry.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{generatedEntry.title}</h3>
                <p className="text-gray-700 leading-relaxed">{generatedEntry.content}</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
                >
                  일기 저장하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
