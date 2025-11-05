
'use client';

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Compass,
  LayoutGrid,
  Users,
  PiggyBank,
  Mail,
  Gift,
  Shield,
  Settings,
  LogOut,
  PenSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/firebase";
import { BottomNav } from "@/components/app/bottom-nav";


const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/vendors", label: "Vendors", icon: Compass },
    { href: "/guest-list", label: "Guests", icon: Users },
    { href: "/budget-tracker", label: "Budget", icon: PiggyBank },
    { href: "/invitations", label: "Invitations", icon: Mail },
    { href: "/registry", label: "Registry", icon: Gift },
    { href: "/website-builder", label: "Website", icon: PenSquare },
    { href: "/admin", label: "Admin", icon: Shield },
];

function AppSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { state } = useSidebar();
    
    const sidebarTitle = useMemo(() => {
        if (state === 'collapsed') {
            return <span className="text-2xl font-logo text-primary">W</span>
        }
        return <span className="text-2xl font-logo text-primary">WedWise</span>
    }, [state]);

    return (
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">{sidebarTitle}</div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                 <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    icon={<item.icon />}
                                    tooltip={item.label}
                                >
                                    {item.label}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/login">
                             <SidebarMenuButton icon={<Avatar className="h-7 w-7"><AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150"} /><AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback></Avatar>}>
                                {user?.displayName}
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-h-screen">
              <SidebarInset>
                {children}
              </SidebarInset>
              <BottomNav />
          </div>
      </SidebarProvider>
  );
}
