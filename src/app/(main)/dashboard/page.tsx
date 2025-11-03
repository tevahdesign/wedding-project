
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
import { useAuth, useDatabase } from "@/firebase"
import { ref } from "firebase/database"
import { useMemo } from "react"
import { useList } from "@/firebase/database/use-list"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const features = [
  {
    title: "AI Style Quiz",
    description: "Personalized wedding style suggestions.",
    icon: Wand2,
    href: "/style-quiz",
  },
  {
    title: "Website Builder",
    description: "Create your beautiful wedding website.",
    icon: Globe,
    href: "/website-builder",
  },
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
  const database = useDatabase()

  const guestsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/guests`)
  }, [user, database])
  const { data: guests } = useList(guestsRef)

  const budgetItemsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/budgetItems`)
  }, [user, database])
  const { data: budgetItems } = useList(budgetItemsRef)

  const registryItemsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/registryItems`)
  }, [user, database])
  const { data: registryItems } = useList(registryItemsRef)

  const { totalSpent } = useMemo(() => {
    if (!budgetItems) return { totalSpent: 0 }
    return budgetItems.reduce(
      (acc, item) => {
        acc.totalSpent += item.spent || 0
        return acc
      },
      { totalSpent: 0 }
    )
  }, [budgetItems])
  
  const guestCount = guests?.length || 0;
  const rsvpCount = guests?.filter(g => g.status === 'Attending').length || 0;
  const purchasedCount = registryItems?.filter(i => i.purchased).length || 0;


  return (
    <div className="flex flex-col flex-1 pb-20">
      <header className="p-4 flex items-center justify-between bg-background border-b">
          <div className="flex items-center gap-3">
             <Heart className="h-8 w-8 text-primary" />
             <h1 className="text-xl font-bold text-foreground">WedEase</h1>
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
      
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Guests Attending</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{rsvpCount} / {guestCount}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
                    <PiggyBank className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Registry</CardTitle>
                    <Gift className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{purchasedCount} Gifts</div>
                </CardContent>
            </Card>
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
