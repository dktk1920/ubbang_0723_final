// utils/emotionUtils.ts

export const emotionLevelMap: Record<string, number> = {
  happy: 1,
  excited: 1,
  proud: 1,
  motivated: 1,

  satisfied: 2,
  calm: 2,
  relieved: 2,

  neutral: 3,
  meh: 3,

  tired: 4,
  anxious: 4,
  stressed: 4,
  nervous: 4,

  sad: 5,
  depressed: 5,
  angry: 5,
  unmotivated: 5,
}

// ✅ 문자열 기반 감정 → 레벨 → 감정 정보
export function getEmotionLevelInfo(emotions: string | string[]) {
  const emotionArray = Array.isArray(emotions) ? emotions : [emotions]

  const levels = emotionArray.map((e) => {
    if (typeof e === "string") {
      return emotionLevelMap[e.toLowerCase()] || 3
    }
    return 3
  })

  const level = Math.min(...levels)

  return getEmotionInfoByLevel(level)  // ✅ 중복 제거를 위해 여기서 재사용
}

// ✅ 숫자 기반 감정 레벨 → 감정 정보
export function getEmotionInfoByLevel(level: number) {
  switch (level) {
    case 1:
      return { label: "매우 긍정적인 하루", emoji: "🌈", color: "bg-yellow-100 text-yellow-800" }
    case 2:
      return { label: "조금 긍정적인 하루", emoji: "🙂", color: "bg-green-100 text-green-800" }
    case 3:
      return { label: "잔잔한 하루", emoji: "😌", color: "bg-gray-100 text-gray-800" }
    case 4:
      return { label: "조금 부정적인 하루", emoji: "😕", color: "bg-blue-100 text-blue-800" }
    case 5:
      return { label: "매우 부정적인 하루", emoji: "😣", color: "bg-red-100 text-red-800" }
    default:
      return { label: "감정 없음", emoji: "❓", color: "bg-slate-100 text-slate-800" }
  }
}
