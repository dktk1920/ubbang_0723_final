"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DiaryEntryType {
  id: string
  date: string | Date
  summary: string
  imageUrl: string
  pk: string
  emotion_level: number
}

interface Props {
  data: DiaryEntryType[]
}

const levelLabelMap = {
  1: "🌈 매우 긍정",
  2: "🙂 조금 긍정",
  3: "😌 중립",
  4: "😕 조금 부정",
  5: "😣 매우 부정",
}

// 📆 누락된 날짜 채우기
function fillMissingDates(data: DiaryEntryType[], month: number, year: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const fullDates: { date: string; level: number | null }[] = []

  const map = new Map(
    data.map((entry) => [
      new Date(entry.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
      entry.emotion_level,
    ])
  )

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day)
    const dateLabel = dateObj.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })

    fullDates.push({
      date: dateLabel,
      level: map.get(dateLabel) ?? null,
    })
  }

  return fullDates
}

export default function EmotionLineChart({ data }: Props) {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()
  const chartData = fillMissingDates(data, month, year)

  return (
    <div className="w-full mt-6 p-6 rounded-xl shadow-md bg-white border border-gray-200 overflow-visible">
      <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">
        📈 이번 달 감정 흐름
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top:30, right: 40, bottom: 20, left: 10 }} // ✅ y축 글자 안겹치도록 여백 확보
        >
          <XAxis
            dataKey="date"
            interval={5}
            tick={{ fontSize: 12, fill: "#555" }}
            axisLine={{ stroke: "#ccc" }}
            tickLine={{ stroke: "#ccc" }}
          />
          <YAxis
            reversed
            domain={[0.8, 5]}
            ticks={[1, 2, 3, 4, 5]}
            allowDataOverflow={true}
            tickFormatter={(v) => levelLabelMap[v as number]}
            tick={{ fontSize: 12, fill: "#444" }}
            axisLine={{ stroke: "#ccc" }}  // ✅ 축선 보이기
            tickLine={{ stroke: "#ccc" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #facc15",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            formatter={(value) =>
              value ? levelLabelMap[value as number] : "기록 없음"
            }
          />
          <Line
            type="monotone"
            dataKey="level"
            stroke="#fb923c"
            strokeWidth={3}
            dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
            activeDot={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
