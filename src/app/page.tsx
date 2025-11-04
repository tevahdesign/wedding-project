
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
    return vendors.filter(vendor => vendor.isFeatured).slice(0, 2);
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

        {/* Search & Categories */}
        <div className="p-4 pt-6 sticky top-[73px] bg-background/80 backdrop-blur-sm z-10 pb-4">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input placeholder="Search for anything..." className="pl-12 h-12 rounded-full bg-card border-transparent focus:bg-white focus:border-primary" />
           </div>
            <div className="flex space-x-3 overflow-x-auto whitespace-nowrap pt-4 -mx-4 px-4 pb-2">
              {categoriesLoading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse"></div>)
              ) : (
                allCategories.map((cat, index) => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.name ? 'default' : 'secondary'}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="rounded-full h-10 px-6"
                >
                  {cat.name}
                </Button>
              )))}
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
          <div className="grid grid-cols-2 gap-4">
            {vendorsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-0 shadow-none h-64 bg-muted animate-pulse rounded-3xl"></Card>)
            ) : (
              newArrivals.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleCardClick(`/vendors/${item.id}`)}
                  onMouseEnter={() => handleMouseEnter(`/vendors/${item.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="border-0 bg-card shadow-none overflow-hidden group rounded-3xl">
                    <CardContent className="p-0 relative">
                      <Image src={item.imageId || "https://picsum.photos/seed/placeholder/400/600"} alt={item.name} width={400} height={600} className="rounded-3xl object-cover w-full aspect-[2/3] transition-transform duration-300 group-hover:scale-105" />
                    </CardContent>
                    <div className="pt-3 px-1">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        {item.isFeatured && <Badge>Featured</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-primary">{item.priceRange}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Popular Vendors */}
        <section className="px-4 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Popular Vendors</h2>
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
              Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-muted shadow-sm h-28 bg-muted animate-pulse rounded-2xl"></Card>)
            ) : (
              popularVendors.map(item => (
                  <div
                    key={item.id} 
                    className="block group cursor-pointer"
                    onClick={() => handleCardClick(`/vendors/${item.id}`)}
                    onMouseEnter={() => handleMouseEnter(`/vendors/${item.id}`)}
                  >
                    <Card className="border-border shadow-sm transition-all hover:shadow-md rounded-2xl bg-card">
                        <CardContent className="p-3 flex gap-4">
                            <Image src={item.imageId || "https://picsum.photos/seed/placeholder/100/100"} alt={item.name} width={100} height={100} className="rounded-xl object-cover aspect-square h-24 w-24"/>
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
                              <p className="font-bold text-primary">{item.priceRange}</p>
                            </div>
                        </CardContent>
                    </Card>
                  </div>
              ))
            )}
          </div>
        </section>

        {/* Tools Section */}
        <section className="p-4 mt-8">
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
                        <Card className="p-4 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 h-full rounded-2xl bg-card">
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
