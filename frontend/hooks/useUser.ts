import { useState, useEffect } from "react"

let globalUser: any = null
let setGlobalUser: ((val: any) => void) | null = null

export function useUser() {
  const [user, _setUser] = useState<any>(null)

  useEffect(() => {
    // ✅ 클라이언트에서만 실행되도록 체크
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        globalUser = parsed
        _setUser(parsed)
      }

      setGlobalUser = _setUser
    }
  }, [])
  return {
    user,
    setUser: (val: any) => {
      globalUser = val
      localStorage.setItem("user", JSON.stringify(val))
      setGlobalUser?.(val)
    }
  }
}