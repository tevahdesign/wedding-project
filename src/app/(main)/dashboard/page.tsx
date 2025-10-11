"use client"

import Link from "next/link"
import {
  ArrowRight,
  Users,
  PiggyBank,
  Gift,
  PlusCircle,
  Wand2,
  Globe,
  Mail,
} from "lucide-react"
import { useAuth, useCollection, useDoc, useFirestore } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"

const features = [
  {
    title: "AI Style Quiz",
    description: "Get personalized wedding style suggestions from our AI.",
    icon: <Wand2 className="w-8 h-8" />,
    href: "/style-quiz",
  },
  {
    title: "Website Builder",
    description: "Create and customize your beautiful wedding website.",
    icon: <Globe className="w-8 h-8" />,
    href: "/website-builder",
  },
  {
    title: "Guest List",
    description: "Manage your guests and track RSVPs with ease.",
    icon: <Users className="w-8 h-8" />,
    href: "/guest-list",
  },
  {
    title: "Budget Tracker",
    description: "Keep your wedding expenses under control.",
    icon: <PiggyBank className="w-8 h-8" />,
    href: "/budget-tracker",
  },
  {
    title: "Digital Invitations",
    description: "Design and send elegant digital invitations.",
    icon: <Mail className="w-8 h-8" />,
    href: "/invitations",
  },
  {
    title: "Wedding Registry",
    description: "Combine gifts from any store into one list.",
    icon: <Gift className="w-8 h-8" />,
    href: "/registry",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firestore = useFirestore()

  const guestsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/guests`)
  }, [user, firestore])
  const { data: guests, loading: guestsLoading } = useCollection(guestsRef)

  const budgetItemsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/budgetItems`)
  }, [user, firestore])
  const { data: budgetItems, loading: budgetLoading } =
    useCollection(budgetItemsRef)

  const registryItemsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/registryItems`)
  }, [user, firestore])
  const { data: registryItems, loading: registryLoading } =
    useCollection(registryItemsRef)

  const { totalBudget, totalSpent } = useMemo(() => {
    if (!budgetItems) return { totalBudget: 0, totalSpent: 0 }
    return budgetItems.reduce(
      (acc, item) => {
        acc.totalBudget += item.budget || 0
        acc.totalSpent += item.spent || 0
        return acc
      },
      { totalBudget: 0, totalSpent: 0 }
    )
  }, [budgetItems])
  
  const guestCount = guests?.length || 0;
  const rsvpCount = guests?.filter(g => g.status === 'Attending').length || 0;
  const purchasedCount = registryItems?.filter(i => i.purchased).length || 0;
  const totalRegistryItems = registryItems?.length || 0;


  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.displayName?.split(" ")[0] || 'Planner'}!`}
        description="Here's a quick overview of your wedding planning progress."
      >
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/guest-list">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Guest
                </Link>
            </Button>
            <Button asChild>
                <Link href="/budget-tracker">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                </Link>
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Guests</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{guestCount} Invited</div>
                <p className="text-xs text-muted-foreground">{rsvpCount} Attending</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <PiggyBank className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">of ${totalBudget.toLocaleString()} Spent</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Registry</CardTitle>
                <Gift className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{purchasedCount} / {totalRegistryItems}</div>
                <p className="text-xs text-muted-foreground">Gifts Purchased</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.href}
            className="flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader>
              <div className="mb-4 text-primary">{feature.icon}</div>
              <CardTitle className="font-headline">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={feature.href}>
                  Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
