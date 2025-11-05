
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, LayoutGrid, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vendors", label: "Vendors", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/login", label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { isMobile } = useSidebar();


  const isPublicVanityPage = !navItems.some(item => pathname.startsWith(item.href)) && pathname !== '/';

  if (!isMobile || pathname === '/login' || (isPublicVanityPage && pathname !== '/')) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 w-full md:hidden z-50 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} prefetch={true} className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4 pt-1">
              <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
