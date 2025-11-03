
"use client"

import Link from "next/link"
import {
  ArrowRight,
  Users,
  PiggyBank,
  Gift,
  Wand2,
  Globe,
  Mail,
  Shield,
  Heart,
  Store,
} from "lucide-react"
import { useAuth } from "@/firebase"

import {
  Card,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const features = [
  {
    title: "Guest List",
    description: "Manage your guests and track RSVPs.",
    icon: Users,
    href: "/guest-list",
  },
  {
    title: "Budget Tracker",
    description: "Keep your wedding expenses in control.",
    icon: PiggyBank,
    href: "/budget-tracker",
  },
   {
    title: "Vendors",
    description: "Browse and book top wedding vendors.",
    icon: Store,
    href: "/vendors",
  },
  {
    title: "Digital Invitations",
    description: "Design and send elegant invitations.",
    icon: Mail,
    href: "/invitations",
  },
  {
    title: "Wedding Registry",
    description: "Combine gifts from any store.",
    icon: Gift,
    href: "/registry",
  },
  {
    title: "Admin Panel",
    description: "Manage vendors and categories.",
    icon: Shield,
    href: "/admin",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  
  return (
    <div className="flex flex-col flex-1 pb-20">
      <header className="p-4 flex items-center justify-between bg-background border-b">
          <div className="flex items-center gap-3">
             
             <h1 className="text-2xl font-headline text-primary">WedWise</h1>
          </div>
        <div className="flex items-center gap-2">
           <Link href="/login">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150"} />
                <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
           </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
            <h2 className="text-2xl font-bold">Welcome, {user?.displayName?.split(" ")[0] || 'Planner'}!</h2>
            <p className="text-muted-foreground">Here's your wedding planning overview.</p>
        </div>

        <h3 className="text-lg font-semibold mb-4">Your Tools</h3>
        <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
            <Link href={feature.href} key={feature.href}>
                <Card
                    className="flex items-center p-4 transition-all hover:bg-muted"
                >
                    <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg"><feature.icon /></div>
                    <div className="flex-1">
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <ArrowRight className="ml-2 h-5 w-5 text-muted-foreground" />
                </Card>
            </Link>
            ))}
        </div>
       </main>
    </div>
  )
}
