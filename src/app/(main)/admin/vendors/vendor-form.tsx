
"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ref, push, set, get } from "firebase/database"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const vendorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  location: z.string().min(2, { message: "Location is required." }),
  priceRange: z.string().min(1, { message: "Price range is required." }),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().min(0),
  isFeatured: z.boolean().default(false),
  imageId: z.string().min(1, { message: "Please select an image." }),
})

type VendorFormValues = z.infer<typeof vendorSchema>
type Vendor = VendorFormValues & { id: string }

type VendorFormProps = {
  setDialogOpen: (open: boolean) => void
  vendorToEdit?: Vendor | null;
}

export function VendorForm({ setDialogOpen, vendorToEdit }: VendorFormProps) {
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  const isEditMode = !!vendorToEdit;

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      location: "New York, NY",
      priceRange: "$$",
      rating: 4.5,
      reviewCount: 0,
      isFeatured: false,
      imageId: "",
    },
  })

   useEffect(() => {
    async function fetchCategories() {
        if (!database) return;
        const categoriesRef = ref(database, 'vendorCategories');
        const snapshot = await get(categoriesRef);
        if (snapshot.exists()) {
            const cats: {id: string, name: string}[] = [];
            snapshot.forEach(child => {
                cats.push({ id: child.key, ...child.val() });
            })
            setCategories(cats);
        }
    }
    fetchCategories();
  }, [database]);

  useEffect(() => {
    if (isEditMode && vendorToEdit) {
      form.reset(vendorToEdit)
    } else {
        form.reset({
            name: "",
            category: "",
            location: "New York, NY",
            priceRange: "$$",
            rating: 4.5,
            reviewCount: 0,
            isFeatured: false,
            imageId: "",
        })
    }
  }, [isEditMode, vendorToEdit, form])

  const onSubmit: SubmitHandler<VendorFormValues> = async (data) => {
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
      if (isEditMode && vendorToEdit?.id) {
          const vendorRef = ref(database, `vendors/${vendorToEdit.id}`);
          await set(vendorRef, data);
          toast({
            title: "Vendor Updated!",
            description: `${data.name}'s details have been updated.`,
          })
      } else {
          const vendorsRef = ref(database, `vendors`);
          const newVendorRef = push(vendorsRef);
          await set(newVendorRef, { ...data, id: newVendorRef.key });
          toast({
            title: "Vendor Added!",
            description: `${data.name} has been added to the marketplace.`,
          });
      }
      form.reset();
      setDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save vendor. Please try again.",
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Vendor's business name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="e.g., New York, NY" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Range</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a price range" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="$$">$$</SelectItem>
                    <SelectItem value="$$$">$$$</SelectItem>
                    <SelectItem value="$$$$">$$$$</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="reviewCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Count</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="imageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select an image" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PlaceHolderImages.map(img => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <Label htmlFor="isFeatured">Featured Vendor</Label>
                        <FormMessage />
                    </div>
                </FormItem>
            )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditMode ? "Save Changes" : "Add Vendor")}
        </Button>
      </form>
    </Form>
  )
}
