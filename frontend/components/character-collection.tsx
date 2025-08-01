"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Gift } from "lucide-react"
import CharacterCard from "@/components/character-card"
import CharacterUnlock from "@/components/character-unlock"

interface Character {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  unlocked: boolean;
  category: 'sweet' | 'savory' | 'special';
  requiredChats?: number;
}

interface CharacterCollectionProps {
  user: {
    pk: number
    nickname: string
    loginMethod: string
    isAnonymous: boolean
  }
}

interface UserStats {
  totalChats: number;
  starCandy: number;
  unlockedCount: number;
  totalCharacters: number;
}

function mapCharacterApiToComponent(char: any): Character {
  if (!char || !char.character_id) {
    console.warn("[캐릭터 변환] character_id가 undefined인 데이터:", char);
  }
  return {
    id: char && char.character_id ? String(char.character_id) : `unknown-${Math.random()}`,
    name: char.name,
    description: char.description,
    rarity: char.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    imageUrl: char.image_url,
    unlocked: !!char.unlocked, // 백엔드 unlocked 값만 사용
    category: char.category as 'sweet' | 'savory' | 'special',
    requiredChats: 0,
  };
}

export default function CharacterCollection({ user }: CharacterCollectionProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "sweet" | "savory" | "special">("all");
  const [unlockedCharacter, setUnlockedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalChats: 0, starCandy: 0, unlockedCount: 0, totalCharacters: 0 });

  useEffect(() => {
    const fetchWithAuthAll = async () => {
      // 캐릭터 목록
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/collection/${user.pk}`);
      const data = await res.json();
      const mapped: Character[] = data.map(mapCharacterApiToComponent);
      setCharacters(mapped);
      // 유저 통계
      const statsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/user-stats/${user.pk}`);
      if (statsRes.status === 404) {
        alert("회원가입 정보가 아직 반영되지 않았습니다. 잠시 후 다시 시도해 주세요.");
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      const stats = await statsRes.json();
      setUserStats({
        totalChats: stats.chat_count,
        starCandy: stats.star_candy,
        unlockedCount: mapped.filter((c) => c.unlocked).length,
        totalCharacters: mapped.length,
      });
    };
    if (user.pk) fetchWithAuthAll();
  }, [user.pk]);

  const filteredCharacters = characters.filter(
    (char) => selectedCategory === "all" || char.category === selectedCategory,
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-yellow-100 text-yellow-800"
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "sweet":
        return "달콤한 빵"
      case "savory":
        return "고소한 빵"
      case "special":
        return "특별한 빵"
      default:
        return "전체"
    }
  }

  // 캐릭터 목록 fetchWithAuth 함수 분리
  const fetchWithAuthCharacters = async () => {
    const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/collection/${user.pk}`);
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn("캐릭터 목록 응답이 배열이 아님:", data);
      setCharacters([]);
      return;
    }
    setCharacters(
      data
        .filter(char => char && char.character_id)
        .map(mapCharacterApiToComponent)
    );
  };

  const handleGachaClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/unlock-random`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pk: user.pk })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "뽑기 실패: 별사탕이 부족합니다!");
        return;
      }
      // 캐릭터 목록 fetchWithAuth
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/collection/${user.pk}`);
      const list = await response.json();
      const mapped = list.map(mapCharacterApiToComponent);
      setCharacters(mapped);
      // 별사탕/수집 캐릭터 수 fetchWithAuth
      const statsRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/character/user-stats/${user.pk}`);
      const stats = await statsRes.json();
      setUserStats({
        totalChats: stats.chat_count,
        starCandy: stats.star_candy,
        unlockedCount: mapped.filter((c: Character) => c.unlocked).length,
        totalCharacters: mapped.length,
      });
      // 뽑힌 캐릭터 모달
      const found = mapped.find((c: Character) => c.id === String(data.character_id));
      if (!found) {
        alert("❌ 해당 캐릭터를 찾을 수 없습니다.");
        return;
      }
      setUnlockedCharacter({ ...found });
    } catch (err) {
      alert("오류 발생!");
    } finally {
      setIsLoading(false);
    }
  };


  // 캐릭터 id 목록을 렌더링 직전 useEffect에서 콘솔로 출력
  useEffect(() => {
    console.log("캐릭터 id 목록:", filteredCharacters.map(c => c.id));
  }, [filteredCharacters]);

  // '다음 별사탕까지' 계산 함수
  const chatsToNextCandy = userStats.totalChats % 5 === 0 ? 5 : 5 - (userStats.totalChats % 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">빵 캐릭터 컬렉션</h1>
            <p className="text-gray-600">대화를 통해 다양한 빵 친구들을 모아보세요!</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            disabled={isLoading}
            onClick={handleGachaClick}
            className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-2 font-bold">
            {isLoading ? "뽑는 중..." : `캐릭터 뽑기🥐 (별사탕⭐: ${userStats.starCandy})`}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{userStats.unlockedCount}</div>
              <div className="text-sm text-gray-600">수집한 캐릭터</div>
              <Progress value={(userStats.unlockedCount / userStats.totalCharacters) * 100} className="mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{chatsToNextCandy}</div>
              <div className="text-sm text-gray-600">다음 별사탕까지</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round((userStats.unlockedCount / userStats.totalCharacters) * 100)}%
              </div>
              <div className="text-sm text-gray-600">수집 완성도</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {["all", "sweet", "savory", "special"].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category as any)}
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                      : "border-gray-300"
                  }
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Character Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCharacters.filter(c => c.id !== undefined).map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              userChats={userStats.totalChats}
              // onClick 제거
            />
          ))}
        </div>

        {/* Unlock Modal */}
        {unlockedCharacter && (
          <CharacterUnlock
            character={unlockedCharacter}
            onClose={() => setUnlockedCharacter(null)}
          />
        )}
      </div>
    </div>
  )
}
