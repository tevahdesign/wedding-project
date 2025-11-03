
"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ref, push, set, get } from "firebase/database"
import Image from "next/image"

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
import { Loader2, PlusCircle, Trash2, X, Upload } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
});

const vendorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  location: z.string().min(2, { message: "Location is required." }),
  priceRange: z.string().min(1, { message: "Price range is required." }),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().min(0),
  isFeatured: z.boolean().default(false),
  imageId: z.string().optional(),
  logoImageId: z.string().optional(),
  galleryImageIds: z.array(z.string()).optional(),
  services: z.array(serviceSchema).optional(),
})

type VendorFormValues = z.infer<typeof vendorSchema>
type Vendor = VendorFormValues & { id: string }

type VendorFormProps = {
  setDialogOpen: (open: boolean) => void
  vendorToEdit?: Vendor | null;
}

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});


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
      priceRange: "₹₹",
      rating: 4.5,
      reviewCount: 0,
      isFeatured: false,
      imageId: "",
      logoImageId: "",
      galleryImageIds: [],
      services: [],
    },
  })

  const { control, handleSubmit, reset, setValue, getValues } = form;

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: "services",
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control,
    name: "galleryImageIds",
  });

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
      reset(vendorToEdit)
    } else {
        reset({
            name: "",
            category: "",
            location: "New York, NY",
            priceRange: "₹₹",
            rating: 4.5,
            reviewCount: 0,
            isFeatured: false,
            imageId: "",
            logoImageId: "",
            galleryImageIds: [],
            services: [],
        })
    }
  }, [isEditMode, vendorToEdit, reset])

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
      const dataToSave = {
        ...data,
        services: data.services || [],
        galleryImageIds: data.galleryImageIds || []
      }

      if (isEditMode && vendorToEdit?.id) {
          const vendorRef = ref(database, `vendors/${vendorToEdit.id}`);
          await set(vendorRef, dataToSave);
          toast({
            title: "Vendor Updated!",
            description: `${data.name}'s details have been updated.`,
          })
      } else {
          const vendorsRef = ref(database, `vendors`);
          const newVendorRef = push(vendorsRef);
          await set(newVendorRef, { ...dataToSave, id: newVendorRef.key });
          toast({
            title: "Vendor Added!",
            description: `${data.name} has been added to the marketplace.`,
          });
      }
      reset();
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

  const ImageUploadField = ({ name, label }: { name: "imageId" | "logoImageId", label: string }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                {field.value ? (
                    <div className="relative w-full h-40">
                         <Image src={field.value} alt={`${label} preview`} fill className="rounded-md object-cover" />
                         <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setValue(name, "")}>
                             <Trash2 className="h-4 w-4" />
                         </Button>
                    </div>
                ) : (
                    <FormControl>
                       <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                               <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                               <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                               <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                           </div>
                           <Input 
                                type="file" 
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const dataUri = await fileToDataUri(file);
                                        field.onChange(dataUri);
                                    }
                                }}
                            />
                       </label>
                    </FormControl>
                )}
                <FormMessage />
            </FormItem>
        )}
    />
  );


  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 pt-4">
                <FormField
                    control={control}
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
                    control={control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                    control={control}
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
                    control={control}
                    name="priceRange"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price Range</FormLabel>
                         <FormControl><Input placeholder="e.g., ₹50,000 - ₹1,00,000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
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
                    control={control}
                    name="reviewCount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Review Count</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                    control={control}
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
                                <Label>Featured Vendor</Label>
                                <p className="text-sm text-muted-foreground">
                                Featured vendors appear more prominently in search results.
                                </p>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploadField name="imageId" label="Main Image" />
                    <ImageUploadField name="logoImageId" label="Logo Image" />
                </div>
            </TabsContent>

            <TabsContent value="gallery">
                 <Card>
                    <CardHeader>
                        <CardTitle>Gallery Images</CardTitle>
                        <CardDescription>Upload multiple images to showcase the vendor's work.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex w-full overflow-x-auto space-x-4 pb-2">
                            {galleryFields.map((field, index) => (
                                <div key={field.id} className="relative flex-shrink-0 w-32 h-32">
                                    {field.value && <Image src={field.value} alt={`Gallery image ${index + 1}`} fill className="rounded-md object-cover" />}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this gallery image? This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => removeGallery(index)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                        <FormControl>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                </div>
                                <Input 
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        const currentValues = getValues("galleryImageIds") || [];
                                        const newValues = await Promise.all(
                                          files.map(file => fileToDataUri(file))
                                        );
                                        setValue("galleryImageIds", [...currentValues, ...newValues]);
                                    }}
                                />
                            </label>
                        </FormControl>
                    </CardContent>
                 </Card>
            </TabsContent>

            <TabsContent value="services">
                 <Card>
                    <CardHeader>
                        <CardTitle>Services</CardTitle>
                        <CardDescription>Add or remove services offered by this vendor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {serviceFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-end p-4 border rounded-lg">
                            <FormField
                            control={control}
                            name={`services.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                <FormLabel>Service Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Full Day Coverage" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={control}
                            name={`services.${index}.price`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 50000" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeService(index)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                        <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendService({ name: "", price: 0 })}
                        >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Service
                        </Button>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>

        <div className="pt-6">
             <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditMode ? "Save Changes" : "Add Vendor")}
             </Button>
        </div>
      </form>
    </Form>
  )
}

    