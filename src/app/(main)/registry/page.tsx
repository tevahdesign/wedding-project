
"use client"

import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Progress } from "@/components/ui/progress"
import { useAuth, useDatabase } from "@/firebase"
import { useMemo } from "react"
import { useList } from "@/firebase/database/use-list"
import { ref } from "firebase/database"

export default function RegistryPage() {
  const { user } = useAuth()
  const database = useDatabase()

  const registryItemsRef = useMemo(() => {
    if (!user || !database) return null
    return ref(database, `users/${user.uid}/registryItems`)
  }, [user, database])

  const { data: registryItems, loading } = useList(registryItemsRef)

  const purchasedCount = registryItems?.filter((item) => item.purchased).length || 0
  const totalItems = registryItems?.length || 0
  const progress = totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <PageHeader
        title="Wedding Registry"
        description="All your wishes in one place."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </PageHeader>
      <div className="p-4 pt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Registry Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress
              value={progress}
              aria-label={`${Math.round(progress)}% of gifts purchased`}
            />
            <p className="text-sm text-muted-foreground">
              {purchasedCount} of {totalItems} gifts purchased.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Share Your Registry
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <div className="aspect-square bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          {registryItems?.map((item) => {
              const itemImage = PlaceHolderImages.find(
              (img) => img.id === item.imageId
            )
            return (
            <Card key={item.id} className="overflow-hidden">
              {itemImage && (
                <div className="aspect-square bg-muted">
                  <Image
                    src={itemImage.imageUrl}
                    alt={itemImage.description}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    data-ai-hint={itemImage.imageHint}
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>From {item.store}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-md font-semibold">{item.price}</p>
              </CardContent>
              <CardFooter className="p-2">
                <Button className="w-full" variant={item.purchased ? "secondary" : "default"} disabled={item.purchased}>
                  {item.purchased ? "Purchased" : "View"}
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      </div>
    </div>
  )
}
