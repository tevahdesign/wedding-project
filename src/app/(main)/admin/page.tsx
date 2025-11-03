
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Store, LayoutGrid } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <>
      <PageHeader
        title="Admin Panel"
        description="Manage your application content and settings."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/vendors">
          <Card className="flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 h-full">
            <CardHeader>
                <div className="mb-4 text-primary">
                    <Store className="w-8 h-8" />
                </div>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Add, edit, or delete vendors from your marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm font-medium text-primary flex items-center">
                    Go to Vendor Management <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/categories">
          <Card className="flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 h-full">
            <CardHeader>
                <div className="mb-4 text-primary">
                    <LayoutGrid className="w-8 h-8" />
                </div>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Add, edit, or delete vendor categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm font-medium text-primary flex items-center">
                    Go to Category Management <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  )
}
