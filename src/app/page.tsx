
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bell, Heart, Menu, Plus, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const newArrivals = [
  {
    id: 1,
    name: "Lace Wedding Dress",
    designer: "Designer Vera Wang",
    price: 650,
    imageUrl: "https://picsum.photos/seed/arrival1/400/600",
    imageHint: "wedding dress"
  },
  {
    id: 2,
    name: "Lace Wedding Dress",
    designer: "Designer Galia Lahav",
    price: 500,
    originalPrice: 450,
    discount: "20%",
    imageUrl: "https://picsum.photos/seed/arrival2/400/600",
    imageHint: "wedding gown"
  }
];

const donations = [
    {
        id: 1,
        name: "Wedding Dress",
        details: "White, Size S",
        seller: "Sarah B.",
        rating: 4.9,
        reviews: 20,
        location: "Los Angeles, California USA",
        price: "Free",
        imageUrl: "https://picsum.photos/seed/donation1/200/200",
        imageHint: "lace dress"
    },
    {
        id: 2,
        name: "Wedding Earrings",
        details: "White Gold",
        imageUrl: "https://picsum.photos/seed/donation2/200/200",
        imageHint: "pearl earrings"
    }
];

const categories = ["NEW!", "Dresses", "Accessories", "Shoes", "Bags", "Free"];


export default function RootPage() {

  return (
    <div className="w-full min-h-screen bg-white text-foreground flex flex-col pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-headline text-yellow-600">Majestic Moments</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search wedding items..." className="pl-10 h-12 rounded-lg bg-gray-100 border-transparent focus:bg-white focus:border-primary" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Categories */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold px-4 mb-2">Categories</h2>
          <div className="flex space-x-3 overflow-x-auto whitespace-nowrap px-4 pb-2">
            {categories.map((cat, index) => (
              <Button 
                key={index}
                variant={cat === 'NEW!' ? 'default' : 'secondary'}
                className={cn("rounded-full", {
                    "bg-red-500 hover:bg-red-600 text-white": cat === 'NEW!',
                    "bg-gray-100 text-gray-800 hover:bg-gray-200": cat !== 'NEW!'
                })}
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mt-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg font-semibold">New Arrivals</h2>
            <Link href="#" className="text-sm text-red-500 font-medium">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 px-4">
            {newArrivals.map(item => (
              <Card key={item.id} className="border-0 shadow-none">
                <CardContent className="p-0 relative">
                  <Image src={item.imageUrl} alt={item.name} width={400} height={600} className="rounded-lg object-cover w-full aspect-[2/3]" data-ai-hint={item.imageHint} />
                  {item.discount && <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-900">{item.discount}</Badge>}
                   <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600">
                    <Plus className="h-5 w-5" />
                  </Button>
                </CardContent>
                <div className="pt-2">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.designer}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-sm font-bold text-red-500">${item.originalPrice || item.price}</p>
                    {item.originalPrice && <p className="text-sm text-muted-foreground line-through">${item.price}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Donations */}
        <section className="mt-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg font-semibold">Donations</h2>
            <Link href="#" className="text-sm text-red-500 font-medium">See All</Link>
          </div>
          <div className="space-y-4 mt-4 px-4">
            {donations.map(item => (
                <Card key={item.id} className="border-gray-200 shadow-sm">
                    <CardContent className="p-3 flex gap-4">
                        <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-md object-cover aspect-square h-24 w-24" data-ai-hint={item.imageHint}/>
                        <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.details}</p>
                            {item.seller && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                     <span>{item.seller}</span>
                                     <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                     <span>{item.rating} ({item.reviews} reviews)</span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-green-600">{item.price}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
