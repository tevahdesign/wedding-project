'use client';

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  Settings,
  LogOut,
  PenSquare,
  Heart,
  LogIn,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/firebase";
import { BottomNav } from "@/components/app/bottom-nav";
import { getAuth, signOut } from "firebase/auth";


const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/my-vendors", label: "My Vendors", icon: Heart },
    { href: "/vendors", label: "Discover", icon: Compass },
    { href: "/guest-list", label: "Guests", icon: Users },
    { href: "/budget-tracker", label: "Budget", icon: PiggyBank },
    { href: "/invitations", label: "Invitations", icon: Mail },
    { href: "/registry", label: "Registry", icon: Gift },
    { href: "/website-builder", label: "Website", icon: PenSquare },
    { href: "/p/preview", label: "Share", icon: Share2 },
];

function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { state } = useSidebar();

    const handleLogout = async () => {
      const auth = getAuth();
      await signOut(auth);
      router.push('/login');
    }
    
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
                    {user ? (
                        <>
                            <SidebarMenuItem>
                                 <SidebarMenuButton icon={<Avatar className="h-7 w-7"><AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150"} /><AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback></Avatar>}>
                                    {user?.displayName}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} icon={<LogOut />} tooltip="Logout">
                                    Logout
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <SidebarMenuItem>
                            <Link href="/login">
                                <SidebarMenuButton icon={<LogIn />} tooltip="Login">
                                    Login
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )}
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
