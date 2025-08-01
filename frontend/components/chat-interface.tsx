"use client"
import { fetchWithAuth } from "@/lib/api"
import { useState, useRef, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import MessageBubble from "@/components/message-bubble"
import SessionSummary from "@/components/session-summary"
import { useRouter } from "next/navigation"
import { getDiaryDateFromTimestamp } from "@/utils/dateUtils";

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatInterfaceProps {
  initialUserInfo: {
    pk: number
    name: string
    userId: string
    loginMethod: string
    gender: string
    mode: string
    worry: string
    birthDate: string
    age: number
    tf: string
  }
}

export default function ChatInterface({ initialUserInfo }: ChatInterfaceProps) {
  const router = useRouter()
  const { user } = useUser()
  const ws = useRef<WebSocket | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [currentAiMessage, setCurrentAiMessage] = useState<Message | null>(null)
  const [showGeneratingModal, setShowGeneratingModal] = useState(false)
  const today = getDiaryDateFromTimestamp(Date.now());


  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasConnectedOnce = useRef(false)

  const activeUser = user ?? initialUserInfo ?? {}
  const pk = activeUser.pk ?? 0
  const userId = activeUser.userId ?? "anonymous"
  const userName = activeUser.name ?? "사용자"
  const gender = activeUser.gender ?? "female"
  const mode = activeUser.mode ?? "banmal"
  const age = Number(activeUser.age) || 25
  const tf = activeUser.tf ?? "f"

    const [loading, setLoading] = useState(false)

    const characterImages = [
        "/images/1-Photoroom.png",
      "/images/8-Photoroom.png",
      "/images/17-Photoroom.png",
      "/images/20-Photoroom.png",
      "/images/25-Photoroom.png",
      "/images/29-Photoroom.png",
      "/images/34-Photoroom.png",
      "/images/35-Photoroom.png",
      "/images/38-Photoroom.png",
      "/images/39-Photoroom.png",
    ]

    const walkingCharacters = characterImages
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    const handleGenerate = async () => {
      try {
        setLoading(true)
        setShowGeneratingModal(true) // ✅ 모달 띄우기
        console.log("📩 감정일기 생성 요청 pk:", pk)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/generate-diary?pk=${pk}`)
        if (!res.ok) throw new Error("서버 오류")

        const result = await res.json()

        if (result.id) {
          router.push(`/${pk}/chat/emotion-diary/${result.id}`)
        } else {
          alert(result.message || "감정일기가 생성되었어요!")
        }
      } catch (err) {
        console.error("❌ 감정일기 생성 실패:", err)
        alert("문제가 발생했어요. 다시 시도해주세요.")
      } finally {
        setLoading(false)
        setShowGeneratingModal(false) // ✅ 모달 닫기
      }
    }



  useEffect(() => {
    if (!pk || hasConnectedOnce.current) return

    const timeout = setTimeout(() => {
      hasConnectedOnce.current = true
      const httpBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ubbangfeeling.com/api/"
      const wsBaseUrl = httpBaseUrl.replace(/^http/, "ws")
      const wsUrl = `${wsBaseUrl}/ws?pk=${pk}&userId=${userId}&mode=${mode}&gender=${gender}&age=${age}&tf=${tf}`

      if (ws.current) {
        ws.current.close()
        ws.current = null
      }

      const socket = new WebSocket(wsUrl)
      ws.current = socket

      socket.onopen = () => {
        console.log("✅ WebSocket 연결됨")
      }

      socket.onmessage = (event) => {
        if (event.data === "...") {
          setIsTyping(true)
          return
        }

        setIsTyping(false)

        setCurrentAiMessage((prev) => {
          if (prev) {
            return { ...prev, content: prev.content + event.data }
          } else {
            return {
              id: Date.now().toString(),
              content: event.data,
              sender: "ai",
              timestamp: new Date(),
            }
          }
        })
      }

      socket.onerror = () => {
        console.log("❌ WebSocket 오류 발생")
        socket.close()
        ws.current = null

        setTimeout(() => {
          hasConnectedOnce.current = false
        }, 1000)
      }

      socket.onclose = () => {
        console.log("🔌 WebSocket 종료됨")
        ws.current = null
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      ws.current?.close()
      ws.current = null
    }
  }, [pk, mode, gender, age])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentAiMessage, isTyping])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    setIsUserTyping(true)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false)
    }, 50)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isUserTyping) return

    if (currentAiMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === currentAiMessage.id)) return prev
        return [...prev, currentAiMessage]
      })
      setCurrentAiMessage(null)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    ws.current?.send(inputMessage)
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

    // 0.5초 후에 isTyping을 true로 설정 (작성 중... 표시)
    setTimeout(() => {
      setIsTyping(true)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

useEffect(() => {
  const loadChatHistory = async () => {
    try {
      const today = getDiaryDateFromTimestamp(Date.now()); // 정확한 오늘 날짜
      console.log("📅 diaryDate:", today);

      const res = await fetchwithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/history?pk=${pk}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("❌ 배열이 아닌 응답:", data);
        return;
      }

    const filtered = data.filter((item: any) => {
      const fallbackDate = getDiaryDateFromTimestamp(item.timestamp);
      const diaryDate = item.diary_date || fallbackDate;

      const isToday = diaryDate === today;

      console.log("🔍 체크", {
        timestamp: item.timestamp,
        diary_date: item.diary_date,
        fallbackDate,
        today,
        isToday,
      });

      return isToday;
    });

      console.log("📅 오늘 날짜:", today);
      console.log("✅ 필터된 메시지 수:", filtered.length);

      const restoredMessages: Message[] = filtered.map((item: any) => ({
        id: item.id,
        content: item.content,
        sender: item.sender,
        timestamp: new Date(item.timestamp),
      }));

      const hasGreeting = restoredMessages.some((msg) => msg.id === "GREETING");

      if (!hasGreeting) {
        restoredMessages.unshift({
          id: "GREETING",
          content: `안녕하세요 ${user?.name ?? initialUserInfo.name}님! 저는 우빵이입니다. 오늘 하루는 어떠셨나요? 편안하게 이야기해 주세요.`,
          sender: "ai",
          timestamp: new Date(),
        });
      }

      setMessages(restoredMessages);
    } catch (err) {
      console.error("❌ 대화 기록 불러오기 실패:", err);
    }
  };

  if (pk) {
    loadChatHistory();
  }
}, [pk]);

return (
  <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm px-4 py-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">

        {/* 좌측: 프로필 + 감정일기 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <img
              src="/images/bread2.png"
              alt="서포터 프로필"
              className="w-10 h-10 rounded-full border-2 border-amber-200 shadow-sm"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-bold text-gray-800">우빵이</h1>
              <p className="text-sm text-gray-500">WhaT's your Feeling</p>
            </div>
          </div>

          <Button
            onClick={!user?.isAnonymous ? handleGenerate : undefined}
            disabled={loading || user?.isAnonymous}
            className={`w-full sm:w-auto font-semibold px-5 py-2 rounded-xl shadow-md transition ${
              user?.isAnonymous
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-amber-300 hover:bg-amber-400 text-white"
            }`}
          >
            {loading ? "생성 중..." : user?.isAnonymous ? "회원 전용" : "✨ 오늘 감정일기 생성하기"}
          </Button>
        </div>

        {/* 우측: 감정 버튼들 */}
        <div className="flex flex-wrap justify-start gap-2">
          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/prologue`)}
            className="w-full sm:w-auto bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium px-4 py-2 rounded-full shadow-sm"
          >
            메인 페이지
          </Button>

          <Button
            size="sm"
            disabled
            className="w-full sm:w-auto bg-amber-100 text-amber-800 font-medium px-4 py-2 rounded-full shadow-sm cursor-default"
          >
            오늘도 고생했어
          </Button>

          <Button
            size="sm"
            onClick={!user?.isAnonymous ? () => router.push(`/${pk}/chat/emotion-diary`) : undefined}
            disabled={user?.isAnonymous}
            className={`w-full sm:w-auto font-medium px-4 py-2 rounded-full shadow-sm ${
              user?.isAnonymous
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-orange-100 hover:bg-orange-200 text-orange-800"
            }`}
          >
            너를 추억해
          </Button>

          <Button
            size="sm"
            onClick={!user?.isAnonymous ? () => router.push(`/${pk}/chat/character-collection`) : undefined}
            disabled={user?.isAnonymous}
            className={`w-full sm:w-auto font-medium px-4 py-2 rounded-full shadow-sm ${
              user?.isAnonymous
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            }`}
          >
            나 보러와
          </Button>

          <Button
            size="sm"
            onClick={() => router.push(`/${pk}/chat/profile`)}
            className="w-full sm:w-auto bg-lime-100 hover:bg-lime-200 text-lime-800 font-medium px-4 py-2 rounded-full shadow-sm"
          >
            이게 너야
          </Button>
        </div>
      </div>
    </div>

    {/* 모달 */}
    {showGeneratingModal && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-4 w-[300px]">
          <div className="text-xl font-semibold text-amber-600">감정일기를 생성 중이에요...</div>
          <p className="text-sm text-gray-500">조금만 기다려 주세요! 📝</p>
        </div>
      </div>
    )}

    {/* 메시지 영역 */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <SessionSummary />
        {[...messages, ...(currentAiMessage ? [{ ...currentAiMessage, id: `stream-${Date.now()}` }] : [])].map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

      {isTyping && (
        <div className="flex justify-start items-end space-x-3">
          <img
            src="/images/bread2.png"
            alt="서포터"
            className="w-8 h-8 rounded-full border border-amber-200 shadow-sm"
          />
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-2">작성 중...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* 입력창 */}
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="너의 이야기를 들려줘"
            className="min-h-[48px] resize-none border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-2xl px-4 py-3"
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping || isUserTyping}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-lg transition-all duration-200"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  </div>
)
}
