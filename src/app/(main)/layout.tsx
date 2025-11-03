"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/firebase"
import { getAuth, signOut } from "firebase/auth"

import {
    LayoutDashboard,
    Wand2,
    Globe,
    Users,
    PiggyBank,
    Mail,
    Gift,
    Store,
    Shield,
    LogOut,
    Heart,
} from "lucide-react"
import { Button } from "../ui/button"

const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/style-quiz", icon: Wand2, label: "AI Style Quiz" },
    { path: "/website-builder", icon: Globe, label: "Website Builder" },
    { path: "/guest-list", icon: Users, label: "Guest List" },
    { path: "/budget-tracker", icon: PiggyBank, label: "Budget Tracker" },
    { path: "/vendors", icon: Store, label: "Vendors" },
    { path: "/invitations", icon: Mail, label: "Digital Invitations" },
    { path: "/registry", icon: Gift, label: "Registry" },
    { path: "/admin", icon: Shield, label: "Admin" },
]

export function MainNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    const handleLogout = async () => {
        const auth = getAuth()
        await signOut(auth)
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 flex items-center gap-4">
                 <Heart className="w-8 h-8 text-primary" />
                 <div>
                    <p className="font-semibold">{user?.displayName || "Welcome!"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                 </div>
            </div>
            <nav className="grid items-start px-4 text-sm font-medium">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                            pathname === item.path ? "bg-muted text-primary" : ""
                        }`}
                        >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
                <Button onClick={handleLogout} variant="ghost" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary justify-start">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </nav>
        </div>
    )
}