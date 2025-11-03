
"use client"

import { useMemo, useState } from "react"
import { ref, remove } from "firebase/database"
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  Trash2,
  Edit,
  Store,
} from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"
import { useToast } from "@/hooks/use-toast"
import { VendorForm } from "./vendor-form"
import Image from "next/image"

type Vendor = {
  id: string
  name: string
  category: string
  location: string
  priceRange: string
  rating: number
  reviewCount: number,
  isFeatured: boolean,
  imageId: string,
}

export default function VendorAdminPage() {
  const database = useDatabase()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const vendorsRef = useMemo(() => {
    if (!database) return null
    return ref(database, `vendors`)
  }, [database])

  const { data: vendors, loading } = useList<Vendor>(vendorsRef)

  const handleAddClick = () => {
    setSelectedVendor(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!database || !selectedVendor) return

    setIsDeleting(true)
    try {
      const vendorRef = ref(
        database,
        `vendors/${selectedVendor.id}`
      )
      await remove(vendorRef)
      toast({
        title: "Vendor Deleted",
        description: `${selectedVendor.name} has been removed.`,
      })
      setIsDeleteAlertOpen(false)
      setSelectedVendor(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description:
          error.message || "Could not delete vendor. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <PageHeader
        title="Vendor Management"
        description="Add, edit, or remove vendors from your marketplace."
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </PageHeader>

       <div className="p-4 pt-0">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedVendor ? "Edit Vendor" : "Add New Vendor"}
                </DialogTitle>
              </DialogHeader>
              <VendorForm 
                setDialogOpen={setIsFormOpen} 
                vendorToEdit={selectedVendor} 
              />
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <span className="font-semibold">{selectedVendor?.name}</span>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Card>
            <CardHeader>
              <CardTitle>All Vendors</CardTitle>
              <CardDescription>
                A total of {vendors?.length || 0} vendors in the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex justify-center items-center gap-2 text-muted-foreground py-10">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading vendors...</span>
                </div>
              )}
              {!loading && vendors?.length === 0 && (
                 <div className="text-center py-10">
                    <div className="flex flex-col items-center gap-4">
                        <Store className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No vendors found.</p>
                        <Button variant="secondary" onClick={handleAddClick} className="mt-2">Add your first vendor</Button>
                    </div>
                  </div>
              )}
              <div className="space-y-4">
              {vendors?.map((vendor) => (
                <Card key={vendor.id} className="flex items-center p-2 pr-0">
                    <Image
                      src={vendor.imageId || "https://picsum.photos/seed/placeholder/100/100"}
                      alt={vendor.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover aspect-square"
                    />
                    <div className="flex-1 space-y-1 ml-4">
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.category}</p>
                        {vendor.isFeatured && <Badge>Featured</Badge>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(vendor)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(vendor)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </Card>
              ))}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  )
}
