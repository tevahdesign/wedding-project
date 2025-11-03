
"use client"

import { useMemo, useState } from "react"
import { ref, remove } from "firebase/database"
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  Trash2,
  Edit,
  LayoutGrid,
} from "lucide-react"
import * as lucideIcons from 'lucide-react';
import type { Icon } from "lucide-react";


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
import { CategoryForm } from "./category-form"

type Category = {
  id: string
  name: string
  description: string
  icon: keyof typeof lucideIcons;
}

export default function CategoryAdminPage() {
  const database = useDatabase()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const categoriesRef = useMemo(() => {
    if (!database) return null
    return ref(database, `vendorCategories`)
  }, [database])

  const { data: categories, loading } = useList<Category>(categoriesRef)

  const handleAddClick = () => {
    setSelectedCategory(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!database || !selectedCategory) return

    setIsDeleting(true)
    try {
      const categoryRef = ref(
        database,
        `vendorCategories/${selectedCategory.id}`
      )
      await remove(categoryRef)
      toast({
        title: "Category Deleted",
        description: `${selectedCategory.name} has been removed.`,
      })
      setIsDeleteAlertOpen(false)
      setSelectedCategory(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description:
          error.message || "Could not delete category. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const renderIcon = (iconName: keyof typeof lucideIcons) => {
    const IconComponent = lucideIcons[iconName] as Icon;
    if (!IconComponent) return null;
    return <IconComponent className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Category Management"
        description="Add, edit, or remove vendor categories."
        showBackButton
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </PageHeader>
      
      <div className="p-4 pt-4">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm 
                setDialogOpen={setIsFormOpen} 
                categoryToEdit={selectedCategory} 
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
                  This will permanently delete the{" "}
                  <span className="font-semibold">{selectedCategory?.name}</span> category. This action cannot be undone.
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

          
          {loading && (
            <div className="flex justify-center items-center gap-2 text-muted-foreground py-10">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading categories...</span>
            </div>
          )}
          {!loading && categories?.length === 0 && (
            <div className="text-center py-10">
                <div className="flex flex-col items-center gap-4">
                  <LayoutGrid className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No categories found.</p>
                  <Button variant="secondary" onClick={handleAddClick} className="mt-2">Add your first category</Button>
              </div>
            </div>
          )}
          <div className="space-y-4">
          {categories?.map((category) => (
            <Card key={category.id} className="flex items-center p-4">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  {renderIcon(category.icon)}
              </div>
              <div className="flex-1 space-y-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
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
                    <DropdownMenuItem onClick={() => handleEditClick(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </Card>
          ))}
          </div>
            
      </div>
    </div>
  )
}
