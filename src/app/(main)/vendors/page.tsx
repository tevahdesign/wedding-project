
'use client'

import { useState } from 'react';
import Image from 'next/image';
import { vendorCategories, popularVendors } from '@/lib/placeholders';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Search, SlidersHorizontal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/app/page-header';

export default function VendorsPage() {
    const [favorited, setFavorited] = useState(
        popularVendors.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.isFavorited;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const toggleFavorite = (id: string) => {
        setFavorited(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <>
            <PageHeader title="Find Vendors">
                <Button variant="ghost" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                </Button>
            </PageHeader>
            
            <div className="px-4 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for venues, photographers..." 
                        className="pl-10 h-12 rounded-lg bg-card"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
                {vendorCategories.map(category => (
                    <Card key={category.id} className="flex flex-col items-center justify-center p-4 gap-2 text-center hover:shadow-lg transition-shadow cursor-pointer">
                        <category.icon className="h-8 w-8 text-primary" />
                        <div className="flex flex-col">
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="px-4 py-5">
                <h2 className="text-2xl font-bold tracking-tight">Popular in New York</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {popularVendors.map(vendor => {
                    const image = PlaceHolderImages.find(img => img.id === vendor.imageId);
                    const isFavorited = favorited[vendor.id];
                    return (
                        <Card key={vendor.id} className="overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                            <div className="relative">
                                {image && (
                                     <Image 
                                        src={image.imageUrl} 
                                        alt={image.description} 
                                        width={400} 
                                        height={300}
                                        className="w-full h-48 object-cover"
                                        data-ai-hint={image.imageHint}
                                    />
                                )}
                               {vendor.isFeatured && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                        FEATURED
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{vendor.name}</p>
                                        <p className="text-sm text-muted-foreground">{vendor.category}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => toggleFavorite(vendor.id)}>
                                        <Heart className={cn("h-6 w-6", isFavorited ? "text-primary fill-primary" : "text-muted-foreground")} />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <span>{vendor.priceRange}</span>
                                    <span className="text-lg">·</span>
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                                    <span>({vendor.reviewCount} reviews)</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </>
    );
}
