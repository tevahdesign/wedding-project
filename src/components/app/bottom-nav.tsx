
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, LayoutGrid, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vendors", label: "Vendors", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/login", label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  // Do not render bottom nav on login page or public website pages
  if (pathname === '/login' || pathname.includes('/wedding-')) {
    return null;
  }
  
  const isSubPage = navItems.some(item => 
    item.href !== '/' && pathname.startsWith(item.href) && pathname !== item.href
  );

  if (isSubPage) {
    return null;
  }


  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
      <div className="flex justify-around items-center h-16 bg-background/70 backdrop-blur-2xl border border-white/20 rounded-full shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4">
              <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
              <span className={cn("text-xs mt-1", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
