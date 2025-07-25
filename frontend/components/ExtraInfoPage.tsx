"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function ExtraInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pk, setPk] = useState<string | null>(null)

  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [worry, setWorry] = useState("")
  const [mode, setMode] = useState("")
  const [age, setAge] = useState("")

  // 🔽 여기에 fetchAndCheckUser 함수 들어감!
  useEffect(() => {
    const fetchAndCheckUser = async () => {
      if (!router.isReady || !router.query.pk) return

      const pkValue = router.query.pk as string
      setPk(pkValue)

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${pkValue}`)

        if (!res.ok) {
          console.warn("❌ 유저를 찾을 수 없음, 새 유저로 처리")
          setLoading(false)
          return
        }

        const user = await res.json()

        if (user.gender && user.birthDate && user.mode && user.age) {
          localStorage.setItem("user", JSON.stringify(user))
          router.push(`/${pkValue}/chat`)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("❌ 유저 조회 중 오류:", err)
        setLoading(false)
      }
    }

    fetchAndCheckUser()
  }, [router])
  const handleSubmit = async () => {
    if (!pk) return

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-info`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pk: Number(pk),
        gender,
        birthDate,
        worry,
        mode,
        age: Number(age),
      }),
    })

    const data = await res.json()
    console.log("✅ 추가 정보 저장 완료", data)

    localStorage.setItem("user", JSON.stringify(data))
    router.push("/chat")
  }

  if (loading) return <p>🔄 로딩 중...</p>

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📝 추가 정보 입력</h1>
      <p>PK: {pk}</p>

      <label>성별 선택</label>
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      >
        <option value="">선택</option>
        <option value="male">남성</option>
        <option value="female">여성</option>
      </select>

      <label>생년월일</label>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />

      <label>걱정거리</label>
      <input
        type="text"
        placeholder="예: 인간관계, 진로, 우울감 등"
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />

      <label>대화 모드</label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      >
        <option value="">선택</option>
        <option value="banmal">반말</option>
        <option value="jondaetmal">존댓말</option>
      </select>

      <label>나이</label>
      <input
        type="number"
        min={10}
        max={100}
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />

      <button onClick={handleSubmit}>✅ 저장하고 시작하기</button>
    </div>
  )
}
