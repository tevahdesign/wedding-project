
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Loader2 } from "lucide-react"
import Link from "next/link"

export default function GuestLoginPage() {
  const router = useRouter()
  const [weddingId, setWeddingId] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weddingId || !accessCode) {
      setError("Please fill in both fields.")
      return
    }
    setLoading(true)
    setError(null)
    
    // Redirect to the dynamic page with the code as a query parameter
    router.push(`/p/${weddingId}?code=${accessCode}`)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 relative overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 -left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-sm">
        <Link href="/" className="flex justify-center items-center gap-2 mb-8 text-foreground">
          <span className="text-5xl font-logo text-primary">WedWise</span>
        </Link>
        <Card className="bg-background/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Guest Dashboard Access</CardTitle>
            <CardDescription>
              Enter the Wedding ID and Access Code provided by the couple.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wedding-id">Wedding ID</Label>
                <Input
                  id="wedding-id"
                  placeholder="e.g., alex-and-jordan"
                  value={weddingId}
                  onChange={(e) => setWeddingId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                  className="bg-background/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter code..."
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  required
                  className="bg-background/80 font-mono tracking-widest"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "View Dashboard"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="text-center mt-4 text-sm text-muted-foreground">
            Are you the wedding planner? <Link href="/login" className="underline text-primary">Login here</Link>.
        </div>
      </div>
    </div>
  )
}
