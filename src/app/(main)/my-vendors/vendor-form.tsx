
"use client"

import { useState } from "react"
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

const vendorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please enter a category." }),
  location: z.string().optional(),
  priceRange: z.string().optional(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

type VendorFormProps = {
  setDialogOpen: (open: boolean) => void
}

export function VendorForm({ setDialogOpen }: VendorFormProps) {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      location: "",
      priceRange: "",
    },
  })

  const onSubmit: SubmitHandler<VendorFormValues> = async (data) => {
    if (!user || !database) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add a vendor.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const myVendorsRef = ref(database, `users/${user.uid}/myVendors`);
      const newVendorRef = push(myVendorsRef);
      await set(newVendorRef, {
        ...data,
        id: newVendorRef.key,
        rating: 0,
        reviewCount: 0,
        isFeatured: false,
        isCustom: true, // Flag to identify custom vendors
        imageId: `https://picsum.photos/seed/${newVendorRef.key}/400/300`,
      });
      
      toast({
        title: "Vendor Added!",
        description: `${data.name} has been added to your personal list.`,
      });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name</FormLabel>
              <FormControl><Input placeholder="e.g., Emily's Flowers" {...field} /></FormControl>
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
              <FormControl><Input placeholder="e.g., Florist" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
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
              <FormLabel>Price Range (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., $$" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full !mt-6">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : "Save Vendor"}
        </Button>
      </form>
    </Form>
  )
}
