
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowRight, Star, Search, X } from "lucide-react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import { useRouter } from 'next/navigation';


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { features } from "@/lib/placeholders"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

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

type HomePageClientProps = {
    vendors: Vendor[];
    categories: VendorCategory[];
}

export function HomePageClient({ vendors, categories }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();


  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )
  
  useEffect(() => {
    router.prefetch('/vendors');
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderCompact(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const allCategories = [{ id: 'All', name: 'All' }, ...categories];

  const newArrivals = vendors.filter(vendor => vendor.isFeatured).slice(0, 5);
  
  const popularVendors = [...vendors]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col pb-28">
      <header className="p-4 space-y-4 sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-logo text-primary">WedWise</h1>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                    <Search className="h-6 w-6" />
                </Button>
                <Link href="/login">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://i.pravatar.cc/150" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
        </div>
        
         <div className={cn("transition-all duration-300 ease-in-out", isHeaderCompact ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100')}>
             <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for anything..." className="pl-12 h-12 rounded-md bg-card border-border focus:bg-white focus:border-primary" />
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-3 pb-2">
                {categories.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 w-24 bg-muted rounded-md animate-pulse shrink-0"></div>)
                ) : (
                    allCategories.map((cat) => (
                    <Button 
                        key={cat.id}
                        variant={selectedCategory === cat.name ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="rounded-md h-9 px-4 border-border shrink-0"
                    >
                        {cat.name}
                    </Button>
                )))}
                </div>
                <ScrollBar orientation="horizontal" className="h-0" />
            </ScrollArea>
        </div>
      </header>

       {isSearchOpen && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-semibold">Search</h2>
             <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
               <X className="h-6 w-6" />
             </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input autoFocus placeholder="Search for venues, photographers..." className="pl-12 h-12 rounded-md text-lg" />
          </div>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto">
        <section className="mt-4">
           <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-semibold">New Arrivals</h2>
            <Link href="/vendors" className="text-sm text-primary font-medium">
              See All
            </Link>
          </div>
           <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            >
            <CarouselContent className="-ml-2">
                {newArrivals.length === 0 ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <CarouselItem key={i} className="pl-4 md:basis-1/2">
                             <Card className="border-0 shadow-none w-full h-52 bg-muted animate-pulse rounded-lg"></Card>
                        </CarouselItem>
                    ))
                ) : (
                    newArrivals.map(item => (
                       <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-1/2">
                            <Link
                                href={`/vendors/${item.id}`}
                                className="cursor-pointer group block"
                            >
                                <Card className="border-border bg-card shadow-sm overflow-hidden rounded-lg">
                                    <div className="relative h-40">
                                        <Image src={item.imageId || "https://picsum.photos/seed/placeholder/800/400"} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-base">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                            {item.isFeatured && <Badge>Featured</Badge>}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </CarouselItem>
                    ))
                )}
            </CarouselContent>
            </Carousel>
        </section>
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-semibold">Popular Vendors</h2>
             <Link href="/vendors" className="text-sm text-primary font-medium">
              See All
            </Link>
          </div>
           <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 px-4">
                {popularVendors.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => <Card key={i} className="border-muted shadow-sm h-52 w-40 bg-muted animate-pulse rounded-lg"></Card>)
                ) : (
                  popularVendors.map(item => (
                      <Link
                        key={item.id} 
                        href={`/vendors/${item.id}`}
                        className="w-40 space-y-3 cursor-pointer group"
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
                      </Link>
                  ))
                )}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
           </ScrollArea>
        </section>

        <section className="p-4 mt-6">
            <h2 className="text-xl font-semibold text-center mb-6">Your Complete Planning Toolkit</h2>
            <div className="grid grid-cols-1 gap-4">
                {features.map((feature) => (
                    <Link href={feature.href} key={feature.title}>
                        <Card
                            className="cursor-pointer group flex items-center p-4 transition-all hover:bg-muted/60 hover:shadow-lg rounded-lg bg-card border-border shadow-sm"
                        >
                            <div className="p-3 bg-primary/10 rounded-full mr-4">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-base">{feature.title}</p>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
      </main>
    </div>
  )
}
