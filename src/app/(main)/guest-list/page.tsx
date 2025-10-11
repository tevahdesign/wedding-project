"use client"

import { useMemo, useState } from "react"
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
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
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
import { useAuth, useCollection, useFirestore } from "@/firebase"
import { collection, doc, deleteDoc } from "firebase/firestore"
import { GuestForm } from "./guest-form"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

type Guest = {
  id: string
  name: string
  email?: string
  group?: string
  status: "Attending" | "Pending" | "Declined"
}

export default function GuestListPage() {
  const { user } = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const guestsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/guests`)
  }, [user, firestore])

  const { data: guests, loading } = useCollection<Guest>(guestsRef)

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

  const handleDeleteConfirm = async () => {
    if (!user || !firestore || !selectedGuest) return;

    setIsDeleting(true);
    const guestRef = doc(firestore, `users/${user.uid}/guests`, selectedGuest.id);

    deleteDoc(guestRef)
      .then(() => {
        toast({
          title: "Guest Deleted",
          description: `${selectedGuest.name} has been removed from your list.`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedGuest(null);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: guestRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Could not delete guest. Please try again.",
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <>
      <PageHeader
        title="Guest List Manager"
        description="Organize your guests and track RSVPs."
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </PageHeader>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedGuest ? "Edit Guest" : "Add New Guest"}</DialogTitle>
          </DialogHeader>
          <GuestForm setDialogOpen={setIsFormOpen} guestToEdit={selectedGuest} />
        </DialogContent>
      </Dialog>
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading guests...
                  </TableCell>
                </TableRow>
              )}
              {guests?.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <div className="font-medium">{guest.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {guest.group}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {guest.group}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        guest.status === "Attending"
                          ? "default"
                          : guest.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        guest.status === "Attending"
                          ? "bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/30 dark:text-green-400"
                          : ""
                      }
                    >
                      {guest.status}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEditClick(guest)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Send Reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(guest)}
                        >
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
