
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

const guestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  group: z.string().optional(),
})

type GuestFormValues = z.infer<typeof guestSchema>

type Guest = GuestFormValues & { id?: string; status: string }

type GuestFormProps = {
  setDialogOpen: (open: boolean) => void
  guestToEdit?: Guest | null;
}

export function GuestForm({ setDialogOpen, guestToEdit }: GuestFormProps) {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!guestToEdit;

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      group: "",
    },
  })

  useEffect(() => {
    if (isEditMode && guestToEdit) {
      form.reset({
        name: guestToEdit.name,
        email: guestToEdit.email,
        group: guestToEdit.group,
      })
    } else {
        form.reset({
            name: "",
            email: "",
            group: "",
        })
    }
  }, [isEditMode, guestToEdit, form])

  const onSubmit: SubmitHandler<GuestFormValues> = async (data) => {
    if (!user || !database) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to modify the guest list.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && guestToEdit?.id) {
          // Update existing guest
          const guestRef = ref(database, `users/${user.uid}/guests/${guestToEdit.id}`);
          await set(guestRef, { ...guestToEdit, ...data });
          toast({
            title: "Guest Updated!",
            description: `${data.name}'s details have been updated.`,
          })
      } else {
          // Add new guest
          const guestsRef = ref(database, `users/${user.uid}/guests`);
          const newGuestRef = push(guestsRef);
          await set(newGuestRef, {
            ...data,
            id: newGuestRef.key,
            status: "Pending",
          });
          toast({
            title: "Guest Added!",
            description: `${data.name} has been added to your guest list.`,
          });
          form.reset();
      }
      setDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save guest. Please try again.",
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Guest's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="guest@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Bride's Family" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditMode ? "Save Changes" : "Save Guest"
          )}
        </Button>
      </form>
    </Form>
  )
}
