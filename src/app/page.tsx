
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Star } from "lucide-react"
import { ref } from "firebase/database"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDatabase } from "@/firebase"
import { useList } from "@/firebase/database/use-list"
import { features } from "@/lib/placeholders"
import { Search } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
  const router = useRouter();
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
    // In a real app, you'd sort by a `createdAt` timestamp.
    // Here we'll just take the first few that are featured.
    return vendors.filter(vendor => vendor.isFeatured).slice(0, 3);
  }, [vendors]);

  const popularVendors = useMemo(() => {
    if (!vendors) return [];
    return [...vendors]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [vendors]);

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleMouseEnter = (path: string) => {
    router.prefetch(path);
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <h1 className="text-3xl font-logo text-primary">WedWise</h1>
        <div className="cursor-pointer" onClick={() => handleCardClick('/login')} onMouseEnter={() => handleMouseEnter('/login')}>
            <Avatar className="h-9 w-9">
                <AvatarImage src="https://i.pravatar.cc/150" />
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-[73px] bg-background/80 backdrop-blur-sm z-10">
            <div className="px-4 pt-2">
                <div className="flex space-x-3 overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
                {categoriesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>)
                ) : (
                    allCategories.map((cat, index) => (
                    <Button 
                    key={cat.id}
                    variant={selectedCategory === cat.name ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="rounded-md h-9 px-4 border-border"
                    >
                    {cat.name}
                    </Button>
                )))}
                </div>
            </div>
        </div>

        {/* Search */}
        <div className="px-4 mt-4">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input placeholder="Search for anything..." className="pl-12 h-12 rounded-md bg-card border-border focus:bg-white focus:border-primary" />
           </div>
        </div>

        {/* New Arrivals */}
        <section className="px-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Arrivals</h2>
            <div 
              className="text-sm text-primary font-medium cursor-pointer"
              onClick={() => handleCardClick('/vendors')}
              onMouseEnter={() => handleMouseEnter('/vendors')}
            >
              See All
            </div>
          </div>
          <div className="space-y-4">
            {vendorsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-0 shadow-none h-40 bg-muted animate-pulse rounded-lg"></Card>)
            ) : (
              newArrivals.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleCardClick(`/vendors/${item.id}`)}
                  onMouseEnter={() => handleMouseEnter(`/vendors/${item.id}`)}
                  className="cursor-pointer group"
                >
                  <Card className="border-border bg-card shadow-sm overflow-hidden rounded-lg relative h-40">
                    <Image src={item.imageId || "https://picsum.photos/seed/placeholder/800/400"} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm">{item.category}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                        <Button size="sm" variant="secondary" className="h-8 rounded-md">View</Button>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Popular Vendors */}
        <section className="mt-4">
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-semibold">Popular Vendors</h2>
            <div 
              className="text-sm text-primary font-medium cursor-pointer"
              onClick={() => handleCardClick('/vendors')}
              onMouseEnter={() => handleMouseEnter('/vendors')}
            >
              See All
            </div>
          </div>
           <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 px-4">
                {vendorsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Card key={i} className="border-muted shadow-sm h-52 w-40 bg-muted animate-pulse rounded-lg"></Card>)
                ) : (
                  popularVendors.map(item => (
                      <div
                        key={item.id} 
                        className="w-40 space-y-3 cursor-pointer group"
                        onClick={() => handleCardClick(`/vendors/${item.id}`)}
                        onMouseEnter={() => handleMouseEnter(`/vendors/${item.id}`)}
                      >
                         <div className="overflow-hidden rounded-lg shadow-sm border border-border">
                            <Image src={item.imageId || "https://picsum.photos/seed/placeholder/160/160"} alt={item.name} width={160} height={160} className="h-auto w-auto object-cover aspect-square transition-transform duration-300 group-hover:scale-105"/>
                         </div>
                         <div className="space-y-1 text-sm">
                           <h3 className="font-semibold leading-none truncate">{item.name}</h3>
                           <div className="flex items-center justify-between">
                             <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                             {item.rating && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
                                </div>
                             )}
                           </div>
                         </div>
                      </div>
                  ))
                )}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
           </ScrollArea>
        </section>

        {/* Tools Section */}
        <section className="p-4 mt-4">
            <h2 className="text-xl font-semibold text-center mb-4">Your Complete Planning Toolkit</h2>
            <div className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {features.map((feature) => (
                      <div
                        key={feature.title}
                        onClick={() => handleCardClick(feature.href)}
                        onMouseEnter={() => handleMouseEnter(feature.href)}
                        className="cursor-pointer"
                      >
                        <Card className="p-4 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 h-full rounded-lg bg-card border-border shadow-sm">
                            <div className="p-3 bg-primary/10 rounded-full mb-2">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-semibold text-sm">{feature.title}</p>
                        </Card>
                      </div>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  )
}
    

    