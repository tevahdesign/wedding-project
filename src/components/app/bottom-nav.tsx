"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Store, User, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vendors", label: "Vendors", icon: Compass },
  { href: "/dashboard", label: "Plan", icon: Heart },
  { href: "/login", label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  // Do not render bottom nav on login page or public website pages
  if (pathname === '/login' || pathname.startsWith('/wedding-')) {
    return null;
  }


  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center text-gray-500 hover:text-red-500 transition-colors w-1/4">
              <item.icon className={cn("h-6 w-6", isActive && "text-red-500")} />
              <span className={cn("text-xs mt-1", isActive ? "text-red-500 font-semibold" : "text-gray-500")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
