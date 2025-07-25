"use client"
import { useParams } from 'next/navigation'
import CommunityPage from "@/components/community-page"

export default function Community() {
  const { pk } = useParams()
  return <CommunityPage userPk={pk} />
}
