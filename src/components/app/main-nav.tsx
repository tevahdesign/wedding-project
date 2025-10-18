
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Wand2,
  Globe,
  Users,
  PiggyBank,
  Mail,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/style-quiz", icon: Wand2, label: "AI Style Quiz" },
  { path: "/website-builder", icon: Globe, label: "Website Builder" },
  { path: "/guest-list", icon: Users, label: "Guest List" },
  { path: "/budget-tracker", icon: PiggyBank, label: "Budget Tracker" },
  { path: "/invitations", icon: Mail, label: "Digital Invitations" },
  { path: "/registry", icon: Gift, label: "Registry" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu className="p-2">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <Link href={item.path} passHref>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.path)}
              tooltip={item.label}
              className="justify-start text-base"
              size="lg"
            >
              <div>
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "group-data-[collapsible=icon]:hidden group-data-[collapsible=offcanvas]:hidden"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
