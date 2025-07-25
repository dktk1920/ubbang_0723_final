"use client"

import { useEffect } from "react"

interface Props {
  enabled: boolean
  time: string
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export default function PushSubscriber({ enabled, time }: Props) {
  console.log("✅ PushSubscriber 렌더링 됨")

  useEffect(() => {
    console.log("🔥 PushSubscriber 실행됨")
    console.log("🔍 enabled 상태:", enabled)
    console.log("🕒 선택된 시간:", time)

    if (!enabled) {
      console.log("🚫 알림 꺼져있음, 구독 안 함")
      return
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("❌ 이 브라우저는 Service Worker를 지원하지 않습니다.")
      return
    }

    if (!("PushManager" in window)) {
      console.warn("❌ 이 브라우저는 Push API를 지원하지 않습니다.")
      return
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn("❗ VAPID_PUBLIC_KEY가 설정되지 않았습니다.")
      return
    }

    const subscribe = async () => {
      try {
        console.log("📦 서비스 워커 등록 시도 중...")
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("✅ 서비스 워커 등록 완료")

        // 기존 구독 확인
        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
          console.log("🔐 새 푸시 구독 시도 중...")
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
          console.log("✅ 새 푸시 구독 완료")
        } else {
          console.log("♻️ 기존 푸시 구독 사용")
        }

        // 서버에 전송
        const serialized = subscription.toJSON()
        console.log("📨 구독 정보 서버에 전송 중...", serialized)

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/save-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: serialized,
            notify_time: time,
          }),
        })

        console.log("✅ 푸시 구독 정보 전송 완료")
      } catch (err) {
        console.error("❌ 푸시 구독 중 오류 발생:", err)
      }
    }

    subscribe()
  }, [enabled, time])

  return null
}
