import Link from "next/link"
import {
  ArrowRight,
  Budget,
  CircleDollarSign,
  Gift,
  Globe,
  LayoutDashboard,
  Mail,
  PiggyBank,
  Users,
  Wand2,
} from "lucide-react"

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
  return (
    <>
      <PageHeader
        title="Welcome to Your Dashboard"
        description="Here's a quick overview of your wedding planning progress."
      />
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
