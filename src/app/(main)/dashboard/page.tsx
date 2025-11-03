
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
  Bell,
  Menu
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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MainNav } from "@/components/app/main-nav"

const features = [
  {
    title: "AI Style Quiz",
    description: "Personalized wedding style suggestions.",
    icon: <Wand2 className="w-6 h-6" />,
    href: "/style-quiz",
  },
  {
    title: "Website Builder",
    description: "Create your beautiful wedding website.",
    icon: <Globe className="w-6 h-6" />,
    href: "/website-builder",
  },
  {
    title: "Guest List",
    description: "Manage your guests and track RSVPs.",
    icon: <Users className="w-6 h-6" />,
    href: "/guest-list",
  },
  {
    title: "Budget Tracker",
    description: "Keep your wedding expenses in control.",
    icon: <PiggyBank className="w-6 h-6" />,
    href: "/budget-tracker",
  },
  {
    title: "Digital Invitations",
    description: "Design and send elegant invitations.",
    icon: <Mail className="w-6 h-6" />,
    href: "/invitations",
  },
  {
    title: "Wedding Registry",
    description: "Combine gifts from any store.",
    icon: <Gift className="w-6 h-6" />,
    href: "/registry",
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
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <header className="p-4 flex items-center justify-between bg-white border-b">
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <MainNav />
            </SheetContent>
          </Sheet>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
          </Button>
           <Link href="/login">
            <Avatar className="h-8 w-8">
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
            <Card className="bg-primary/10 border-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Guests Attending</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{rsvpCount} / {guestCount}</div>
                </CardContent>
            </Card>
            <Card className="bg-secondary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
                    <PiggyBank className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="bg-secondary">
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
                    <div className="mr-4 text-primary">{feature.icon}</div>
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
