"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileText, X } from "lucide-react"

interface SummaryData {
  summary: string
  advice: string
}

export default function SessionSummary() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  useEffect(() => {
  fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/weather-summary`)
    .then((res) => res.json())
    .then((data) => setSummaryData(data))
    .catch(() => {
      setSummaryData({
        summary: "날씨 정보를 불러오지 못했어요.",
        advice: "",
      })
    })
  }, [])


  if (!isVisible || !summaryData) return null

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-800">오늘의 날씨</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-amber-700 leading-relaxed">
          <p>
            {summaryData.summary}
            {isExpanded && <span> {summaryData.advice}</span>}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-6 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-100 p-0"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              접기
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              더보기
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
