"use client"

import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import { useEffect } from "react"

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })

    const handleStart = () => NProgress.start()
    const handleStop = () => NProgress.done()

    handleStop() // Stop progress on initial load

    return () => {
      handleStop()
    }
  }, [])

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null // This component doesn't render anything itself
}
