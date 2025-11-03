import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase/client-provider"
import { ProgressBar } from "@/components/app/progress-bar"
import { Suspense } from "react"
import { BottomNav } from "@/components/app/bottom-nav"

export const metadata: Metadata = {
  title: "WedEase",
  description: "Your personal wedding planning assistant",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <FirebaseClientProvider>
          <main className="app-container bg-white">
            {children}
            <BottomNav />
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}
