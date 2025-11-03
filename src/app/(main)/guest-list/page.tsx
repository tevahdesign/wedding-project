
"use client"

import { useMemo, useState } from "react"
import { ref, remove, update } from "firebase/database"
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  Circle,
  XCircle,
  Download,
  Mail,
  Users,
  Edit,
  Trash2
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
import { useAuth, useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"
import { GuestForm } from "./guest-form"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type GuestStatus = "Attending" | "Pending" | "Declined"

type Guest = {
  id: string
  name: string
  email?: string
  phoneNumber?: string
  group?: string
  status: GuestStatus
}

const statusOptions: { value: GuestStatus; label: string; icon: React.FC<any> }[] = [
  { value: "Attending", label: "Attending", icon: CheckCircle },
  { value: "Pending", label: "Pending", icon: Circle },
  { value: "Declined", label: "Declined", icon: XCircle },
]

export default function GuestListPage() {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const guestsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/guests`)
  }, [user, database])

  const { data: guests, loading } = useList<Guest>(guestsRef)
  
  const handleAddClick = () => {
    setSelectedGuest(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsDeleteAlertOpen(true)
  }

  const handleStatusChange = async (guest: Guest, newStatus: GuestStatus) => {
    if (!user || !database) return

    const guestRef = ref(database, `users/${user.uid}/guests/${guest.id}`)
    try {
      await update(guestRef, { status: newStatus })
      toast({
        title: "Status Updated",
        description: `${guest.name}'s status has been changed to ${newStatus}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update status. Please try again.",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!user || !database || !selectedGuest) return

    setIsDeleting(true)
    try {
      const guestRef = ref(
        database,
        `users/${user.uid}/guests/${selectedGuest.id}`
      )
      await remove(guestRef)
      toast({
        title: "Guest Deleted",
        description: `${selectedGuest.name} has been removed from your list.`,
      })
      setIsDeleteAlertOpen(false)
      setSelectedGuest(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description:
          error.message || "Could not delete guest. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadgeClasses = (status: GuestStatus) => {
    return cn({
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300": status === "Attending",
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300": status === "Pending",
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300": status === "Declined",
    });
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <PageHeader
        title="Guest List"
        description="Manage your guests and track RSVPs"
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </PageHeader>

      <div className="p-4 pt-0">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedGuest ? "Edit Guest" : "Add New Guest"}
                </DialogTitle>
              </DialogHeader>
              <GuestForm 
                setDialogOpen={setIsFormOpen} 
                guestToEdit={selectedGuest} 
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
                  <span className="font-semibold">{selectedGuest?.name}</span> from
                  your guest list. This action cannot be undone.
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
              <CardTitle>All Guests</CardTitle>
              <CardDescription>
                A total of {guests?.length || 0} guests have been invited.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                  <div className="flex justify-center items-center gap-2 text-muted-foreground py-10">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading guests...</span>
                  </div>
              )}
              {!loading && guests?.length === 0 && (
                  <div className="text-center py-10">
                    <div className="flex flex-col items-center gap-4">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No guests found.</p>
                        <Button variant="secondary" onClick={handleAddClick} className="mt-2">Add your first guest</Button>
                    </div>
                  </div>
              )}
              <div className="space-y-4">
              {guests?.map((guest) => (
                <Card key={guest.id} className="flex items-center p-4">
                    <div className="flex-1 space-y-1">
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-muted-foreground">{guest.group}</p>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          variant="outline"
                          className={cn("cursor-pointer transition-colors hover:bg-muted", getStatusBadgeClasses(guest.status))}
                        >
                          {guest.status}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {statusOptions.map(option => (
                           <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleStatusChange(guest, option.value)}
                          >
                            <option.icon className="mr-2 h-4 w-4" />
                            <span>{option.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          className="ml-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(guest)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(guest)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
