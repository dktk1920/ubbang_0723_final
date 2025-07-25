"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles, Gift } from "lucide-react"
import React from "react";

interface Character {
  id: string
  name: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  imageUrl: string
  unlocked: boolean
  unlockedAt?: Date
  requiredChats?: number // 백엔드 정책상 없음, optional
  category: "sweet" | "savory" | "special"
}

interface CharacterUnlockProps {
  character: Character
  onClose: () => void
}

export default function CharacterUnlock({ character, onClose }: CharacterUnlockProps) {
  const [showAnimation, setShowAnimation] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-red-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "일반"
      case "rare":
        return "레어"
      case "epic":
        return "에픽"
      case "legendary":
        return "전설"
      default:
        return "일반"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-sm w-full shadow-2xl">
        <CardContent className="p-6 text-center space-y-4">
          {showAnimation ? (
            <>
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center animate-pulse">
                  <Gift className="w-12 h-12 text-yellow-600" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">새로운 친구 발견!</h2>
              <p className="text-gray-600">특별한 빵 친구가 나타났어요!</p>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                  <img
                    src={character.imageUrl || "/placeholder.svg"}
                    alt={character.name}
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">{character.name}</h2>
                <p className="text-gray-600 text-sm">{character.description}</p>
                <Badge className={`${getRarityColor(character.rarity)} border-0`}>
                  {getRarityLabel(character.rarity)}
                </Badge>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">🎉 축하합니다! 새로운 빵 친구를 만났어요!</p>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                확인
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>

  )
}
