
'use client';

import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Store, LayoutGrid } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleMouseEnter = (path: string) => {
    router.prefetch(path);
  };

  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Admin Panel"
        description="Manage your application content and settings."
        showBackButton
      />
      <div className="p-4 pt-4 grid gap-4">
          <Card 
            className="flex items-center p-4 transition-all hover:bg-muted cursor-pointer"
            onClick={() => handleCardClick('/admin/vendors')}
            onMouseEnter={() => handleMouseEnter('/admin/vendors')}
          >
             <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg">
                <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">Vendor Management</p>
                <p className="text-sm text-muted-foreground">Add, edit, or delete vendors</p>
            </div>
            <ArrowRight className="ml-2 h-5 w-5 text-muted-foreground" />
          </Card>
          <Card 
            className="flex items-center p-4 transition-all hover:bg-muted cursor-pointer"
            onClick={() => handleCardClick('/admin/categories')}
            onMouseEnter={() => handleMouseEnter('/admin/categories')}
          >
            <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg">
                <LayoutGrid className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">Category Management</p>
                <p className="text-sm text-muted-foreground">Add, edit, or delete categories</p>
            </div>
            <ArrowRight className="ml-2 h-5 w-5 text-muted-foreground" />
          </Card>
      </div>
    </div>
  )
}
