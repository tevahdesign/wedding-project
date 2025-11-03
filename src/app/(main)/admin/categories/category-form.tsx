
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
import { useDatabase } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
  icon: z.string().min(1, { message: "Icon name is required (e.g., 'Church')." }),
})

type CategoryFormValues = z.infer<typeof categorySchema>
type Category = CategoryFormValues & { id: string }

type CategoryFormProps = {
  setDialogOpen: (open: boolean) => void
  categoryToEdit?: Category | null;
}

export function CategoryForm({ setDialogOpen, categoryToEdit }: CategoryFormProps) {
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!categoryToEdit;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  })

  useEffect(() => {
    if (isEditMode && categoryToEdit) {
      form.reset(categoryToEdit)
    } else {
        form.reset({
            name: "",
            description: "",
            icon: "",
        })
    }
  }, [isEditMode, categoryToEdit, form])

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    if (!database) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Database connection not available.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && categoryToEdit?.id) {
          const categoryRef = ref(database, `vendorCategories/${categoryToEdit.id}`);
          await set(categoryRef, data);
          toast({
            title: "Category Updated!",
            description: `${data.name}'s details have been updated.`,
          })
      } else {
          const categoriesRef = ref(database, `vendorCategories`);
          const newCategoryRef = push(categoriesRef);
          await set(newCategoryRef, { ...data, id: newCategoryRef.key });
          toast({
            title: "Category Added!",
            description: `${data.name} has been added.`,
          });
      }
      form.reset();
      setDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save category. Please try again.",
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6 pl-1">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl><Input placeholder="e.g., Venues" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="A short description of the category" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon Name</FormLabel>
                <FormControl><Input placeholder="Lucide Icon Name (e.g., Church)" {...field} /></FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                    Find icon names on <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">lucide.dev/icons</a>.
                </p>
              </FormItem>
            )}
          />
        

        <Button type="submit" disabled={isSubmitting} className="w-full !mt-8">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditMode ? "Save Changes" : "Add Category")}
        </Button>
      </form>
    </Form>
  )
}
