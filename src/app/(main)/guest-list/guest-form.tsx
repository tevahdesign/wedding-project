
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
import { Loader2, ChevronsUpDown, Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

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
  existingGroups: string[];
}

export function GuestForm({ setDialogOpen, guestToEdit, existingGroups }: GuestFormProps) {
  const { user } = useAuth()
  const database = useDatabase()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");


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
          const guestRef = ref(database, `users/${user.uid}/guests/${guestToEdit.id}`);
          await set(guestRef, { ...guestToEdit, ...data });
          toast({
            title: "Guest Updated!",
            description: `${data.name}'s details have been updated.`,
          })
      } else {
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
              <FormItem className="flex flex-col">
                <FormLabel>Group (Optional)</FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? existingGroups.find(
                              (group) => group === field.value
                            ) || field.value
                          : "Select or create a group"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search group or create new..."
                        value={inputValue}
                        onValueChange={setInputValue}
                       />
                       <CommandList>
                        <CommandEmpty
                          onSelect={() => {
                            form.setValue("group", inputValue);
                            setPopoverOpen(false);
                          }}
                        >
                           <div className="cursor-pointer p-2">Create new group: &quot;{inputValue}&quot;</div>
                        </CommandEmpty>
                        <CommandGroup>
                          {existingGroups.map((group) => (
                            <CommandItem
                              value={group}
                              key={group}
                              onSelect={() => {
                                form.setValue("group", group)
                                setPopoverOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  group === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {group}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
