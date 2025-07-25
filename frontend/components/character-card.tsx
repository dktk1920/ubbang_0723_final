"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Star } from "lucide-react"
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

interface CharacterCardProps {
  character: Character
  userChats: number
  onClick?: () => void // optional로 변경
}

export default function CharacterCard({ character, userChats }: CharacterCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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

  // unlock 관련 로직 완전히 제거
  // const canUnlock = !character.unlocked && userChats >= character.requiredChats;

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-200 ${
        character.unlocked
          ? "hover:shadow-xl"
          : "opacity-60"
      }`}
    >
      <CardContent className="p-4 text-center space-y-3">
        <div className="relative">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
              character.unlocked ? "bg-gradient-to-br from-amber-100 to-orange-100" : "bg-gray-100"
            }`}
          >
            {character.unlocked ? (
              <img
                src={character.imageUrl || "/placeholder.svg"}
                alt={character.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        <div>
          <h3 className={`font-semibold text-sm ${character.unlocked ? "text-gray-800" : "text-gray-400"}`}>
            {character.unlocked ? character.name : "???"}
          </h3>
          <p className={`text-xs mt-1 ${character.unlocked ? "text-gray-600" : "text-gray-400"}`}>
            {character.unlocked ? character.description : "?"}
          </p>
        </div>

        <Badge className={`text-xs ${getRarityColor(character.rarity)}`}>{getRarityLabel(character.rarity)}</Badge>
        {/* '획득 가능!' 등 unlock 관련 UI 완전히 제거 */}
      </CardContent>
    </Card>
  )
}
