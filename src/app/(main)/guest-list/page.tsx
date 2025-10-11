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
import { PlusCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth, useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { GuestForm } from "./guest-form"

export default function GuestListPage() {
  const { user } = useAuth()
  const firestore = useFirestore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const guestsRef = useMemo(() => {
    if (!user || !firestore) return null
    return collection(firestore, `users/${user.uid}/guests`)
  }, [user, firestore])

  const { data: guests, loading } = useCollection(guestsRef)

  return (
    <>
      <PageHeader
        title="Guest List Manager"
        description="Organize your guests and track RSVPs."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <GuestForm setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </PageHeader>
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
                          ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
