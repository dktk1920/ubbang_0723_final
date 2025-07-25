// app/[pk]/chat/character-collection/page.tsx
"use client"

import CharacterCollection from "@/components/character-collection"

export default function CharacterCollectionPage({ params }: { params: { pk: string } }) {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null
  const user = userStr ? JSON.parse(userStr) : null

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        유저 정보를 불러올 수 없습니다.
      </div>
    )
  }

  return <CharacterCollection user={user} />
}
