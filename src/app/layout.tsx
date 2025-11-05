
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase/client-provider"
import { ProgressBar } from "@/components/app/progress-bar"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "WedWise",
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
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <FirebaseClientProvider>
            {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}
