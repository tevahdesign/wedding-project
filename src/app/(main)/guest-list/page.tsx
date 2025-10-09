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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const guests = [
  { name: "Eleanor Vance", email: "eleanor@example.com", status: "Attending", group: "Bride's Family" },
  { name: "Marcus Thorne", email: "marcus@example.com", status: "Attending", group: "Groom's Family" },
  { name: "Isabella Rossi", email: "isabella@example.com", status: "Pending", group: "Friends" },
  { name: "Julian Croft", email: "julian@example.com", status: "Declined", group: "Friends" },
  { name: "Sophia Chen", email: "sophia@example.com", status: "Attending", group: "Bride's Family" },
  { name: "Liam Gallagher", email: "liam@example.com", status: "Pending", group: "Work" },
]

export default function GuestListPage() {
  return (
    <>
      <PageHeader title="Guest List Manager" description="Organize your guests and track RSVPs.">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
              <DialogDescription>
                Add a new guest to your list. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="Guest's full name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" placeholder="guest@example.com" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group" className="text-right">Group</Label>
                <Input id="group" placeholder="e.g., Bride's Family" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Guest</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>All Guests</CardTitle>
          <CardDescription>
            A total of {guests.length} guests have been invited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.email}>
                  <TableCell>
                    <div className="font-medium">{guest.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{guest.group}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{guest.group}</TableCell>
                  <TableCell>
                    <Badge variant={guest.status === 'Attending' ? 'default' : guest.status === 'Pending' ? 'secondary' : 'destructive'} 
                           className={guest.status === 'Attending' ? 'bg-green-500/20 text-green-700' : ''}>
                      {guest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
