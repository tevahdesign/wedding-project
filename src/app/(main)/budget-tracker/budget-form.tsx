
"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ref, push, set } from "firebase/database"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuth, useDatabase } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const budgetItemSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  budget: z.coerce.number().min(0, { message: "Budget must be a positive number." }),
  spent: z.coerce.number().min(0, { message: "Spent amount must be a positive number." }),
  notes: z.string().optional(),
})

export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>

export type BudgetItem = BudgetItemFormValues & { id: string }

type BudgetFormProps = {
  setDialogOpen: (open: boolean) => void
  itemToEdit?: BudgetItem | null;
}

export function BudgetForm({ setDialogOpen, itemToEdit }: BudgetFormProps) {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!itemToEdit;

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      name: "",
      budget: 0,
      spent: 0,
      notes: "",
    },
  })

  useEffect(() => {
    if (isEditMode && itemToEdit) {
      form.reset(itemToEdit)
    } else {
        form.reset({
            name: "",
            budget: 0,
            spent: 0,
            notes: "",
        })
    }
  }, [isEditMode, itemToEdit, form])

  const onSubmit: SubmitHandler<BudgetItemFormValues> = async (data) => {
    if (!user || !database) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to modify the budget.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && itemToEdit?.id) {
          const itemRef = ref(database, `users/${user.uid}/budgetItems/${itemToEdit.id}`);
          await set(itemRef, data);
          toast({
            title: "Item Updated!",
            description: `The ${data.name} item has been updated.`,
          })
      } else {
          const itemsRef = ref(database, `users/${user.uid}/budgetItems`);
          const newItemRef = push(itemsRef);
          await set(newItemRef, { ...data, id: newItemRef.key });
          toast({
            title: "Item Added!",
            description: `The ${data.name} item has been added to your budget.`,
          });
      }
      form.reset();
      setDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save item. Please try again.",
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input placeholder="e.g., Venue" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Budgeted Amount</FormLabel>
                    <FormControl><Input type="number" placeholder="₹100,000" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="spent"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Amount Spent</FormLabel>
                    <FormControl><Input type="number" placeholder="₹85,000" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl><Textarea placeholder="e.g., Final payment due on the 15th" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" disabled={isSubmitting} className="w-full !mt-8">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditMode ? "Save Changes" : "Add Expense")}
        </Button>
      </form>
    </Form>
  )
}
