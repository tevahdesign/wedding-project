"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { collection, addDoc, doc, setDoc } from "firebase/firestore"

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
import { useAuth, useFirestore } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

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
  const firestore = useFirestore()
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
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to modify the guest list.",
      })
      return
    }

    setIsSubmitting(true)

    if (isEditMode && guestToEdit?.id) {
        // Update existing guest
        const guestRef = doc(firestore, `users/${user.uid}/guests`, guestToEdit.id);
        const guestData = { ...guestToEdit, ...data };

        setDoc(guestRef, guestData, { merge: true })
          .then(() => {
            toast({
              title: "Guest Updated!",
              description: `${data.name}'s details have been updated.`,
            })
            setDialogOpen(false)
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: guestRef.path,
              operation: 'update',
              requestResourceData: guestData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              variant: "destructive",
              title: "Update Failed",
              description: "Could not update guest. Please try again.",
            })
          })
          .finally(() => setIsSubmitting(false));
      } else {
        // Add new guest
        const guestData = {
          ...data,
          status: "Pending",
        }
        const guestsRef = collection(firestore, `users/${user.uid}/guests`)

        addDoc(guestsRef, guestData)
          .then(() => {
            toast({
              title: "Guest Added!",
              description: `${data.name} has been added to your guest list.`,
            })
            form.reset()
            setDialogOpen(false)
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: guestsRef.path,
              operation: 'create',
              requestResourceData: guestData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Could not add guest. Please try again.",
            })
          })
          .finally(() => setIsSubmitting(false));
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
