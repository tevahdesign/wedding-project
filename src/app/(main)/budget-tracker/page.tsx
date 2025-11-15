
"use client"

import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

import { PlusCircle, MoreHorizontal, Loader2, PiggyBank, Trash2, Edit, Pencil } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { useAuth, useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"
import { ref, remove, update, set } from "firebase/database"
import { BudgetForm, type BudgetItem } from "./budget-form"
import { useToast } from "@/hooks/use-toast"
import { useObjectValue } from "@/firebase/database/use-object-value"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function BudgetTrackerPage() {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch individual budget items
  const budgetItemsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/budgetItems`)
  }, [user, database])
  const { data: budgetData, loading: itemsLoading } = useList<BudgetItem>(budgetItemsRef)

  // Fetch and manage total budget
  const totalBudgetRef = useMemo(() => {
    if (!user || !database) return null;
    return ref(database, `users/${user.uid}/budget/total`);
  }, [user, database]);
  const { data: totalBudget, loading: totalBudgetLoading } = useObjectValue<number>(totalBudgetRef);
  
  const [localTotalBudget, setLocalTotalBudget] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
      setLocalTotalBudget(totalBudget ?? 0);
  }, [totalBudget]);


  const { totalSpent } = useMemo(() => {
    if (!budgetData) return { totalSpent: 0 }
    return budgetData.reduce(
      (acc, item) => {
        acc.totalSpent += Number(item.spent) || 0
        return acc
      },
      { totalSpent: 0 }
    )
  }, [budgetData])
  
  const handleTotalBudgetSave = async () => {
    if (!totalBudgetRef) return;
    try {
      await set(totalBudgetRef, localTotalBudget);
      toast({ title: "Total budget updated!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update budget." });
    } finally {
        setIsEditingBudget(false);
    }
  }

  const remainingBudget = (totalBudget || 0) - totalSpent;
  const progressValue = (totalBudget || 0) > 0 ? (totalSpent / (totalBudget || 1)) * 100 : 0

  const handleAddClick = () => {
    setSelectedItem(null)
    setIsFormOpen(true)
  }
  
  const handleEditClick = (item: BudgetItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  }

  const handleDeleteClick = (item: BudgetItem) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!user || !database || !selectedItem) return;

    setIsDeleting(true);
    try {
      const itemRef = ref(database, `users/${user.uid}/budgetItems/${selectedItem.id}`);
      await remove(itemRef);
      toast({
        title: "Item Deleted",
        description: `The ${selectedItem.name} item has been removed from your budget.`,
      });
      setIsDeleteAlertOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete item. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const loading = itemsLoading || totalBudgetLoading;

  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Budget Tracker"
        description="Keep your wedding finances in order."
        showBackButton
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </PageHeader>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm setDialogOpen={setIsFormOpen} itemToEdit={selectedItem} />
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
              This will permanently delete the{" "}
              <span className="font-semibold">{selectedItem?.name}</span> item.
              This action cannot be undone.
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

      <div className="p-4 pt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <div className="flex justify-between items-end">
                <CardDescription>
                {loading
                    ? "Loading budget..."
                    : `You've spent ₹${totalSpent.toLocaleString()} of your budget.`}
                </CardDescription>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total Budget: ₹</span>
                    {isEditingBudget ? (
                        <Input 
                            type="number" 
                            value={localTotalBudget} 
                            onChange={(e) => setLocalTotalBudget(Number(e.target.value))}
                            onBlur={handleTotalBudgetSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTotalBudgetSave()}
                            className="w-32 h-8"
                            autoFocus
                        />
                    ) : (
                        <span 
                            className="font-semibold text-lg text-primary"
                            onClick={() => setIsEditingBudget(true)}
                        >
                            {(totalBudget ?? 0).toLocaleString()}
                        </span>
                    )}
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingBudget(true)}>
                        <Pencil className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={progressValue}
              aria-label={`${Math.round(progressValue)}% of budget spent`}
            />
          </CardContent>
          <CardFooter>
            <p className={cn("text-sm", remainingBudget < 0 ? "text-destructive" : "text-muted-foreground")}>
              {remainingBudget >= 0
                ? `₹${remainingBudget.toLocaleString()} remaining.`
                : `₹${Math.abs(remainingBudget).toLocaleString()} over budget.`
              }
            </p>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>A detailed list of your wedding expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading expenses...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && budgetData?.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <PiggyBank className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold">No expenses yet</h3>
                            <p className="text-muted-foreground">Add your first expense to start tracking your budget.</p>
                            <Button variant="secondary" onClick={handleAddClick} className="mt-2">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add First Expense
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {budgetData?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          ₹{Number(item.budget).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{Number(item.spent).toLocaleString()}
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
                              <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(item)}>
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
      </div>
    </div>
  )
}
