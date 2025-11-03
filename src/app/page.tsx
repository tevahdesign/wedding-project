
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, Menu, Search, Star } from "lucide-react"
import { ref } from "firebase/database"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"

type Vendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  imageId: string;
  isFavorited: boolean;
};

type VendorCategory = {
  id: string;
  name: string;
};

export default function RootPage() {
  const database = useDatabase();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoriesRef = useMemo(() => database ? ref(database, 'vendorCategories') : null, [database]);
  const { data: categories, loading: categoriesLoading } = useList<VendorCategory>(categoriesRef);

  const vendorsRef = useMemo(() => database ? ref(database, 'vendors') : null, [database]);
  const { data: vendors, loading: vendorsLoading } = useList<Vendor>(vendorsRef);

  const allCategories = useMemo(() => {
    return [{ id: 'All', name: 'All' }, ...(categories || [])];
  }, [categories]);

  const newArrivals = useMemo(() => {
    if (!vendors) return [];
    return vendors.filter(vendor => vendor.isFeatured).slice(0, 2);
  }, [vendors]);

  const popularVendors = useMemo(() => {
    if (!vendors) return [];
    return [...vendors]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);
  }, [vendors]);

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
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>)
            ) : (
              allCategories.map((cat, index) => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.name ? 'default' : 'secondary'}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn("rounded-full", {
                    "bg-red-500 hover:bg-red-600 text-white": selectedCategory === cat.name,
                    "bg-gray-100 text-gray-800 hover:bg-gray-200": selectedCategory !== cat.name
                })}
              >
                {cat.name}
              </Button>
            )))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mt-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg font-semibold">New Arrivals</h2>
            <Link href="/vendors" className="text-sm text-red-500 font-medium">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 px-4">
            {vendorsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-0 shadow-none h-64 bg-gray-200 animate-pulse rounded-lg"></Card>)
            ) : (
              newArrivals.map(item => (
                <Link href={`/vendors/${item.id}`} key={item.id}>
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0 relative">
                      <Image src={item.imageId || "https://picsum.photos/seed/placeholder/400/600"} alt={item.name} width={400} height={600} className="rounded-lg object-cover w-full aspect-[2/3]" />
                      {item.isFeatured && <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-900">Featured</Badge>}
                    </CardContent>
                    <div className="pt-2">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-red-500">{item.priceRange}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Popular Vendors */}
        <section className="mt-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg font-semibold">Popular Vendors</h2>
            <Link href="/vendors" className="text-sm text-red-500 font-medium">See All</Link>
          </div>
          <div className="space-y-4 mt-4 px-4">
            {vendorsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-gray-200 shadow-sm h-28 bg-gray-200 animate-pulse"></Card>)
            ) : (
              popularVendors.map(item => (
                  <Link href={`/vendors/${item.id}`} key={item.id}>
                    <Card className="border-gray-200 shadow-sm">
                        <CardContent className="p-3 flex gap-4">
                            <Image src={item.imageId || "https://picsum.photos/seed/placeholder/100/100"} alt={item.name} width={100} height={100} className="rounded-md object-cover aspect-square h-24 w-24"/>
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                {item.rating && (
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span>{item.rating.toFixed(1)} ({item.reviewCount} reviews)</span>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{item.priceRange}</p>
                            </div>
                        </CardContent>
                    </Card>
                  </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
