
"use client"

import { useMemo, useState } from "react"
import { ref, remove, update } from "firebase/database"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  Circle,
  XCircle,
  Download,
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

  const downloadAsCSV = (data: Guest[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no guest data to download.",
      });
      return;
    }

    const headers = ["ID", "Name", "Email", "Group", "Status"];
    const csvContent = [
      headers.join(","),
      ...data.map(item => [
        item.id,
        `"${item.name}"`,
        `"${item.email || ''}"`,
        `"${item.group || ''}"`,
        item.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsPDF = (data: Guest[], filename: string, title: string) => {
    if (!data || data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no guest data to download.",
      });
      return;
    }

    const doc = new jsPDF();
    doc.text(title, 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [['Name', 'Email', 'Group', 'Status']],
      body: data.map(guest => [
        guest.name,
        guest.email || 'N/A',
        guest.group || 'N/A',
        guest.status,
      ]),
      headStyles: { fillColor: [100, 84, 144] }, // Primary color
    });

    doc.save(filename);
  };

  const handleDownload = (format: 'csv' | 'pdf', filter?: 'Bride' | 'Groom') => {
    if (!guests) return;
    
    let data = guests;
    let title = "Full Guest List";
    let baseFilename = "full-guest-list";

    if (filter) {
        data = guests.filter(g => g.group === filter);
        title = `${filter}'s Guest List`;
        baseFilename = `guest-list-${filter.toLowerCase()}`;
    }

    if (format === 'csv') {
        downloadAsCSV(data, `${baseFilename}.csv`);
    } else {
        downloadAsPDF(data, `${baseFilename}.pdf`, title);
    }
  };

  return (
    <>
      <PageHeader
        title="Guest List Manager"
        description="Organize your guests and track RSVPs."
      >
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>CSV Downloads</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleDownload('csv')}>Download Full List (CSV)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('csv', 'Bride')}>Download Bride's List (CSV)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('csv', 'Groom')}>Download Groom's List (CSV)</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>PDF Downloads</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleDownload('pdf')}>Download Full List (PDF)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('pdf', 'Bride')}>Download Bride's List (PDF)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('pdf', 'Groom')}>Download Groom's List (PDF)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Guest
            </Button>
        </div>
      </PageHeader>

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
                  <TableCell colSpan={4} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading guests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && guests?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <p className="text-muted-foreground">No guests added yet.</p>
                    <Button variant="link" onClick={handleAddClick} className="mt-2">Add your first guest</Button>
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
                        <DropdownMenuItem
                          onClick={() => handleEditClick(guest)}
                        >
                          Edit Guest Details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Send Reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(guest)}
                        >
                          Delete Guest
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
