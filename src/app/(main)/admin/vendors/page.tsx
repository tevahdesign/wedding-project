
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
    <>
      <PageHeader
        title="Vendor Management"
        description="Add, edit, or remove vendors from your marketplace."
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </PageHeader>

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading vendors...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && vendors?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                     <div className="flex flex-col items-center gap-4">
                        <Store className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No vendors found.</p>
                        <Button variant="secondary" onClick={handleAddClick} className="mt-2">Add your first vendor</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {vendors?.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                   <TableCell>{vendor.location}</TableCell>
                   <TableCell>
                       {vendor.isFeatured && <Badge>Yes</Badge>}
                   </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
