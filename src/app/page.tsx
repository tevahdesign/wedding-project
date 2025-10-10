"use client"

import { useAuth } from "@/firebase"
import { Gem } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <Gem className="w-12 h-12 animate-spin text-primary" />
    </div>
  )
}
