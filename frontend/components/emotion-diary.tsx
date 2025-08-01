"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Plus, Calendar } from "lucide-react"
import DiaryEntry from "@/components/diary-entry"
import DiaryCreation from "@/components/diary-creation"
import { getEmotionInfoByLevel } from "@/utils/emotionUtils"
import EmotionLineChart from "@/components/EmotionLineChart"

interface DiaryEntryType {
  id: string
  date: string | Date
  summary: string
  imageUrl: string
  pk: string
  emotion_level: number
  message: string
}

interface EmotionDiaryProps {
  user: {
    name: string
    loginMethod: string
    isAnonymous: boolean
  }
}

export default function EmotionDiary({ user }: EmotionDiaryProps) {
  const router = useRouter()
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryType[]>([])
  const [showCreation, setShowCreation] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntryType | null>(null)
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    const fetchDiary = async () => {
      const userRaw = localStorage.getItem("user")
      if (!userRaw) {
        console.error("❌ user 없음")
        return
      }

      const user = JSON.parse(userRaw)
      const pk = Number(user.pk)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/diary?pk=${pk}`)
      const data = await res.json()

      if (!Array.isArray(data)) {
        console.error("❌ diary 응답이 배열이 아님:", data)
        return
      }

      const parsed = data.map((entry: any) => ({
        id: entry.id,
        pk: entry.pk,
        date: new Date(entry.date),
        summary: entry.summary,
        imageUrl: entry.imageUrl || entry.image_url || "/placeholder.svg",
        emotion_level: entry.emotion_level ?? 3,
        message : entry.message ?? "",
      }))
      parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setDiaryEntries(parsed)
    }

    fetchDiary()
  }, [])

  const handleCreateDiary = () => {
    setShowCreation(false)
    window.location.reload()
  }

  if (showCreation) {
    return <DiaryCreation onComplete={handleCreateDiary} onCancel={() => setShowCreation(false)} />
  }

  if (selectedEntry) {
    return <DiaryEntry entry={selectedEntry} onBack={() => setSelectedEntry(null)} />
  }

  // 📅 이번 달 감정일기만 필터링
  const currentMonth = new Date().getMonth()
  const thisMonthEntries = diaryEntries.filter(
    (entry) => new Date(entry.date).getMonth() === currentMonth
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">너를 추억해</h1>
            <p className="text-gray-600">너와의 이야기를 추억하는 공간이야</p>
          </div>
        </div>

        {/* 📊 감정 흐름 보기 */}
        <div className="p-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center space-y-2">
            <Button
              onClick={() => setShowChart((v) => !v)}
              className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 py-3 rounded-xl text-sm font-semibold"
            >
              {showChart ? "감추기 ❌" : "이번 달 감정 흐름 보기 📊"}
            </Button>
          </CardContent>
        </Card>
          {showChart && thisMonthEntries.length > 0 && (
            <EmotionLineChart data={thisMonthEntries} />
          )}
        </div>

        {/* Diary Entries */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-amber-600" />
            너를 기억해
          </h2>

          {diaryEntries.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">오늘이 우리 1일이야.</p>
                <p className="text-gray-400 text-sm mt-2">나랑 놀자!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diaryEntries.map((entry, index) => {
                const emotionInfo = getEmotionInfoByLevel(Number(entry.emotion_level ?? 3))

                return (
                  <Card
                    key={entry.id ? `diary-${entry.id}` : `diary-fallback-${index}`}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (!entry.id) {
                        console.error("❌ entry.id 없음", entry)
                      } else {
                        router.push(`/${user.pk}/chat/emotion-diary/${entry.id}`)
                      }
                    }}
                  >
                    <CardContent className="p-0">
                      <img
                        src={entry.imageUrl ? `${entry.imageUrl}?t=${Date.now()}` : "/placeholder.svg"}
                        onError={(e) => {
                          console.error("이미지 로딩 실패:", entry.imageUrl)
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                        alt="감정 그림일기"
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-4 space-y-2">
                        <div className={`rounded-lg px-4 py-2 text-center font-semibold text-sm ${emotionInfo.color}`}>
                          {emotionInfo.emoji} {emotionInfo.label}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{entry.summary}</p>
                        <div className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
