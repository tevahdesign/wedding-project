
'use client'

import {
  ArrowRight,
  Users,
  PiggyBank,
  Gift,
  Mail,
  Store,
  PenSquare,
} from "lucide-react"
import { useAuth } from "@/firebase"
import { useRouter } from "next/navigation"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { PageHeader } from "@/components/app/page-header"

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
    title: "Website Builder",
    description: "Create your public wedding site.",
    icon: PenSquare,
    href: "/website-builder",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  const getHref = (feature: typeof features[number]) => {
    return feature.href;
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={`Welcome, ${user?.displayName?.split(" ")[0] || 'Planner'}!`}
        description="Let's continue planning your perfect day."
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 font-headline">Your Planning Tools</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature) => (
                <Link href={getHref(feature)} key={feature.href}>
                    <Card
                        className="flex items-center p-4 transition-all hover:bg-muted/60 hover:shadow-lg cursor-pointer h-full"
                    >
                        <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg"><feature.icon className="w-5 h-5"/></div>
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
