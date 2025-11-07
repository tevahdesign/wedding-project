
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase/client-provider"
import { ProgressBar } from "@/components/app/progress-bar"
import { Suspense } from "react"
import { Great_Vibes, Dancing_Script, Sacramento, Playfair_Display, Poppins } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-great-vibes',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sacramento',
  display: 'swap',
});


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
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${poppins.variable} ${greatVibes.variable} ${dancingScript.variable} ${sacramento.variable}`}>
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
