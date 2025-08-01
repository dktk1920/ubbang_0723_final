"use client"

import { useUser } from "@/hooks/useUser"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Mail, Lock, Calendar, MessageCircle, Heart } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, CalendarDays } from "lucide-react"
import { Calendar as DatePicker } from "@/components/ui/calendar"
import { format } from "date-fns";
import { ko } from "date-fns/locale"

interface SignupProps {
  onComplete: (userData: {
    pk: number
    name: string
    userId: string
    gender: string
    mode: string
    worry: string
    birthDate: string
  }) => void
  onBack: () => void
}

export default function Signup({ onComplete, onBack }: SignupProps) {
  const { setUser } = useUser()
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
    email: "",
    socialId: "",
    gender: "",
    worry: "",
    birthDate: "",
    mode:"",
    tf:"",
  })

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<"form" | "submitting" | "complete">("form")

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const dateString = `${year}-${month}-${day}`
      handleInputChange("birthDate", dateString)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userId.trim()) newErrors.userId = "아이디를 입력해주세요"
    if (formData.userId.length < 4) newErrors.userId = "아이디는 4자 이상이어야 합니다"

    if (!formData.password.trim()) newErrors.password = "비밀번호를 입력해주세요"
    if (formData.password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다"

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }

    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다"
    }

    if (!formData.mode) newErrors.mode = "말투를 선택해주세요"
    if (!formData.gender) newErrors.gender = "성별을 선택해주세요"
    if (!formData.tf) newErrors.tf = "이성적(T) 공감적(F) 대화스타일을 선택해주세요"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async () => {
  console.log("폼 제출 시도됨")

  if (!validateForm()) {
    console.log("유효성 검사 실패")
    console.log("입력값 확인:", formData)
    return
  }

  console.log("Fetch 요청 보냄!")

  setStep("submitting")

  try {
    const calculatedAge = calculateAge(formData.birthDate)
    const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
      name: formData.name,
      userId: formData.userId,
      password: formData.password,
      email: formData.email,
      gender: formData.gender,
      birthDate: formData.birthDate,
      socialId: formData.socialId || null,
      mode: formData.mode,
      worry: formData.currentConcern || null,
      age: Number(calculatedAge),
      tf:formData.tf
      }),
    })
    console.log("✅ BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL)

    console.log("응답 상태코드:", response.status)

    const responseClone = response.clone()
    const resText = await responseClone.text()
    console.log("서버 응답 텍스트:", resText)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ 가입 완료:", data)

    // ✅ access_token 저장
    localStorage.setItem('access_token', data.access_token);

      // ✅ 로그인과 동일한 형식으로 localStorage 저장
    const localStorageUserData = {
      pk: data.pk,
      userId: data.userId,
      name: data.name,
      gender: data.gender,
      mode: data.mode,
      worry: data.worry,
      birthDate: data.birthDate,
      loginMethod: data.loginMethod,
      tf: data.tf,  // 기본값 설정
      age: Number(calculatedAge),
    }
    localStorage.setItem("user", JSON.stringify(localStorageUserData))

      setStep("complete")

      setTimeout(() => {
        const onCompleteUserData = {
          pk: data.pk, // ← 서버에서 받아온 응답에 포함되어야 함
          name: formData.name,
          userId: formData.userId,
          gender: formData.gender,
          mode: formData.mode,
          tf:formData.tf,
          worry: formData.currentConcern || "",
          birthDate: formData.birthDate,
        }
        onComplete(onCompleteUserData)
        }, 1500)
    } else {
      const errorData = await response.json()
      console.error("❌ 회원가입 실패:", resText)
      // 🎯 에러 메시지 분기 처리
      if (response.status === 400 && errorData.detail === "이미 사용 중인 아이디입니다.") {
        setErrors((prev) => ({ ...prev, userId: errorData.detail }))
      } else {
        alert("회원가입 중 오류가 발생했습니다.")
      }

      setStep("form")
    }
  } catch (error) {
    console.error("❌ 서버 연결 실패:", error)
    alert("서버에 연결할 수 없습니다.")
    setStep("form")
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="w-full max-w-md space-y-6">

        {step === "form" && (
          <>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h1>
                <p className="text-gray-600">우빵이와 함께 시작해보세요</p>
              </div>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg text-gray-800">계정 정보</CardTitle>
                <CardDescription className="text-gray-600">안전하고 개인화된 상담을 위한 정보입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* User Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-amber-600" />
                    이름
                  </label>
                  <Input
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="사용할 이름을 입력하세요"
                    className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                      errors.name ? "border-red-300" : ""
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>


                {/* User ID */}
                {/* 아이디 입력 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-amber-600" />
                    아이디
                  </label>
                  <Input
                    type="text"
                    name="username"
                    autoComplete="off"
                    value={formData.userId}
                    onChange={(e) => handleInputChange("userId", e.target.value)}
                    placeholder="사용할 아이디를 입력하세요"
                    className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                      errors.userId ? "border-red-300" : ""
                    }`}
                  />
                  {errors.userId && <p className="text-xs text-red-600 mt-1">{errors.userId}</p>}
                </div>

                {/* 비밀번호 입력 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-amber-600" />
                    비밀번호
                  </label>
                  <Input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="6자 이상의 비밀번호"
                    className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                      errors.password ? "border-red-300" : ""
                    }`}
                  />
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-amber-600" />
                    비밀번호 확인
                  </label>
                  <Input
                    autoComplete="off"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                      errors.confirmPassword ? "border-red-300" : ""
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-amber-600" />
                    이메일 주소
                  </label>
                  <Input
                    autoComplete="off"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@email.com"
                    className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                      errors.email ? "border-red-300" : ""
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* Social ID (Optional) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-amber-600" />
                    소셜 계정 ID (선택사항)
                  </label>
                  <Input
                    value={formData.socialId}
                    onChange={(e) => handleInputChange("socialId", e.target.value)}
                    placeholder="카카오톡, 네이버 등의 계정 ID"
                    className="h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
                  />
                </div>

                {/* 생년월일 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-amber-600" />
                    생년월일
                    {formData.birthDate && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        {calculateAge(formData.birthDate)}세
                      </span>
                    )}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left h-12 border-gray-200 hover:border-amber-300 focus:border-amber-300 focus:ring-amber-200 rounded-xl bg-white/50 backdrop-blur-sm ${
                          errors.birthDate ? "border-red-300" : ""
                        }`}
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-amber-600" />
                        {selectedDate ? (
                          <span className="text-gray-800">
                            {format(selectedDate, "yyyy년 MM월 dd일", { locale: ko })}
                          </span>
                        ) : (
                          <span className="text-gray-500">생년월일을 선택해주세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white/95 backdrop-blur-sm border-amber-200 shadow-xl"
                      align="start"
                    >
                      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <h4 className="text-sm font-medium text-amber-800">생년월일 선택</h4>
                        <p className="text-xs text-amber-600">나이는 자동으로 계산됩니다</p>
                      </div>
                      <DatePicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        captionLayout="dropdown-buttons"
                        fromYear={1940}
                        toYear={2010}
                        className="rounded-md"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium text-amber-800",
                          nav: "space-x-1 flex items-center",
                          nav_button:
                            "h-7 w-7 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md transition-colors",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-amber-600 rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative hover:bg-amber-50 rounded-md transition-colors",
                          day: "h-9 w-9 p-0 font-normal hover:bg-amber-100 hover:text-amber-800 rounded-md transition-colors",
                          day_selected:
                            "bg-amber-400 text-white hover:bg-amber-500 hover:text-white focus:bg-amber-500 focus:text-white",
                          day_today: "bg-orange-100 text-orange-800 font-semibold",
                          day_outside: "text-gray-400 opacity-50",
                          day_disabled: "text-gray-400 opacity-50",
                          day_hidden: "invisible",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.birthDate && <p className="text-xs text-red-600">{errors.birthDate}</p>}
                </div>

                {/* 성별 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-amber-600" />
                    성별
                  </label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger
                      className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                        errors.gender ? "border-red-300" : ""
                      }`}
                    >
                      <SelectValue placeholder="성별을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-red-600">{errors.gender}</p>}
                </div>

                {/* Mode (반말/존댓말) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    말투
                  </label>
                  <Select
                    value={formData.mode}
                    onValueChange={(value) => handleInputChange("mode", value)}
                  >
                    <SelectTrigger
                      className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl`}
                    >
                      <SelectValue placeholder="말투를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banmal">반말</SelectItem>
                      <SelectItem value="jondaetmal">존댓말</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.mode && <p className="text-xs text-red-600">{errors.mode}</p>}
                </div>

                {/* T/F 성향 선택 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    성향 (감성/이성)
                  </label>
                  <Select
                    value={formData.tf}
                    onValueChange={(value) => handleInputChange("tf", value)}
                  >
                    <SelectTrigger
                      className={`h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl ${
                        errors.tf ? "border-red-300" : ""
                      }`}
                    >
                      <SelectValue placeholder="대화스타일을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="f">감성형 (Feeling)</SelectItem>
                      <SelectItem value="t">이성형 (Thinking)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tf && <p className="text-xs text-red-600">{errors.tf}</p>}
                </div>


                {/* Current Concern */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-amber-600" />
                    현재 고민 (선택사항)
                  </label>
                  <Textarea
                    value={formData.currentConcern}
                    onChange={(e) => handleInputChange("currentConcern", e.target.value)}
                    placeholder="현재 가지고 있는 고민이나 상담받고 싶은 내용을 간단히 적어주세요"
                    className="min-h-[80px] border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-lg transition-all duration-200 mt-6"
                >
                  회원가입 완료
                </Button>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    🔒 개인정보 보호: 입력하신 모든 정보는 암호화되어 안전하게 저장되며, 상담 서비스 제공 목적으로만
                    사용됩니다. 언제든지 계정 삭제 및 정보 삭제가 가능합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === "submitting" && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">계정 생성 중</h3>
              <p className="text-gray-600">안전한 계정을 생성하고 있습니다...</p>
            </CardContent>
          </Card>
        )}

        {step === "complete" && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">가입 완료!</h3>
              <p className="text-gray-600">WTF에 오신 것을 환영합니다</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}