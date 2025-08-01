"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
      console.log("📢 useEffect 실행됨");
    const exchangeCode = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

          // ✅ 여기에서 console.log로 값 확인
      console.log("📌 code:", code);
      console.log("📌 state:", state);

      if (!code) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/naver/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });

        const result = await response.json();
        console.log("✅ 로그인 결과:", result);

        if (result.success) {
          const { user, access_token } = result;
          localStorage.setItem("user", JSON.stringify({ ...user, access_token }));
          router.push(`/${user.pk}/chat`);
          return;
        } else {
          alert("로그인 실패");
        }
      } catch (err) {
        console.error("로그인 오류", err);
      }
    };

    exchangeCode();
  }, [searchParams]);

  return <div className="p-4 text-center">네이버 로그인 처리 중입니다...</div>;
}

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">로딩 중...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
