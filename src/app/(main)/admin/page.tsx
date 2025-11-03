
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Store, LayoutGrid } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <PageHeader
        title="Admin Panel"
        description="Manage your application content and settings."
      />
      <div className="p-4 pt-0 grid gap-4">
        <Link href="/admin/vendors">
          <Card className="flex items-center p-4 transition-all hover:bg-muted">
             <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg">
                <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">Vendor Management</p>
                <p className="text-sm text-muted-foreground">Add, edit, or delete vendors</p>
            </div>
            <ArrowRight className="ml-2 h-5 w-5 text-muted-foreground" />
          </Card>
        </Link>
        <Link href="/admin/categories">
          <Card className="flex items-center p-4 transition-all hover:bg-muted">
            <div className="mr-4 text-primary bg-primary/10 p-3 rounded-lg">
                <LayoutGrid className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">Category Management</p>
                <p className="text-sm text-muted-foreground">Add, edit, or delete categories</p>
            </div>
            <ArrowRight className="ml-2 h-5 w-5 text-muted-foreground" />
          </Card>
        </Link>
      </div>
    </div>
  )
}
