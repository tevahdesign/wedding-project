"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { collection, addDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuth, useFirestore } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const guestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  group: z.string().optional(),
})

type GuestFormValues = z.infer<typeof guestSchema>

type GuestFormProps = {
  setDialogOpen: (open: boolean) => void
}

export function GuestForm({ setDialogOpen }: GuestFormProps) {
  const { user } = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      group: "",
    },
  })

  const onSubmit: SubmitHandler<GuestFormValues> = async (data) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add a guest.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const guestsRef = collection(firestore, `users/${user.uid}/guests`)
      await addDoc(guestsRef, {
        ...data,
        status: "Pending",
      })

      toast({
        title: "Guest Added!",
        description: `${data.name} has been added to your guest list.`,
      })
      form.reset()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error adding guest:", error)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not add guest. Please try again.",
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
            "Save Guest"
          )}
        </Button>
      </form>
    </Form>
  )
}
