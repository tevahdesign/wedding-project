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

const registryItems = [
  {
    id: "item-1",
    title: "Honeymoon Fund",
    description: "Contribute to our dream getaway!",
    store: "Cash Fund",
    price: "Varies",
    image: PlaceHolderImages.find(img => img.id === 'registry-item-1'),
    purchased: true,
  },
  {
    id: "item-2",
    title: "Deluxe Kitchenware Set",
    description: "Pots, pans, and everything we need to cook.",
    store: "Crate & Barrel",
    price: "$499.99",
    image: PlaceHolderImages.find(img => img.id === 'registry-item-2'),
    purchased: false,
  },
  {
    id: "item-3",
    title: "Cozy Throw Blanket",
    description: "For movie nights on the couch.",
    store: "West Elm",
    price: "$129.00",
    image: PlaceHolderImages.find(img => img.id === 'registry-item-3'),
    purchased: false,
  },
]

export default function RegistryPage() {
  const purchasedCount = registryItems.filter(item => item.purchased).length;
  const progress = (purchasedCount / registryItems.length) * 100;

  return (
    <>
      <PageHeader title="Wedding Registry" description="All your wishes in one place.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item or Link
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {registryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.image && (
                  <div className="aspect-square bg-muted">
                    <Image
                      src={item.image.imageUrl}
                      alt={item.image.description}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      data-ai-hint={item.image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>From {item.store}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{item.price}</p>
                </CardContent>
                <CardFooter>
                   <Button className="w-full" disabled={item.purchased}>
                    {item.purchased ? "Purchased" : "View & Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 sticky top-8">
           <Card>
            <CardHeader>
              <CardTitle>Registry Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress} aria-label={`${Math.round(progress)}% of gifts purchased`} />
               <p className="text-sm text-muted-foreground">{purchasedCount} of {registryItems.length} gifts purchased.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Share Your Registry</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
