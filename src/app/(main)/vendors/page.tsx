
'use client'

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Search, SlidersHorizontal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/app/page-header';
import { useAuth, useDatabase } from '@/firebase';
import { useList } from '@/firebase/database/use-list';
import { ref } from 'firebase/database';
import type { Icon } from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define types for our data
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
    logoImageId?: string;
};

type VendorCategory = {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof lucideIcons;
};

export default function VendorsPage() {
    const { user } = useAuth();
    const database = useDatabase();
    
    // Fetch categories and vendors from Firebase
    const categoriesRef = useMemo(() => database ? ref(database, 'vendorCategories') : null, [database]);
    const vendorsRef = useMemo(() => database ? ref(database, 'vendors') : null, [database]);

    const { data: categories, loading: categoriesLoading } = useList<VendorCategory>(categoriesRef);
    const { data: vendors, loading: vendorsLoading } = useList<Vendor>(vendorsRef);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [favorited, setFavorited] = useState<Record<string, boolean>>({});

    // This effect initializes the favorited state from the fetched vendor data
    useState(() => {
        if (vendors) {
            setFavorited(vendors.reduce((acc, vendor) => {
                acc[vendor.id] = vendor.isFavorited;
                return acc;
            }, {} as Record<string, boolean>));
        }
    });

    const toggleFavorite = (id: string) => {
        setFavorited(prev => ({ ...prev, [id]: !prev[id] }));
        // Here you would also update the database
    };

    const filteredVendors = useMemo(() => {
        if (!vendors) return [];
        return vendors.filter(vendor => {
            const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
            const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [vendors, selectedCategory, searchTerm]);

    const allCategories = useMemo(() => {
        return [{ id: 'All', name: 'All', description: 'All vendors', icon: 'LayoutGrid' as const }, ...(categories || [])];
    }, [categories]);


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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
                {categoriesLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted"></Card>)
                ) : (
                    allCategories.map(category => {
                        const Icon = lucideIcons[category.icon] as Icon;
                        return (
                            <Card 
                                key={category.id} 
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 gap-2 text-center hover:shadow-lg transition-shadow cursor-pointer",
                                    selectedCategory === category.name && "border-primary ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedCategory(category.name)}
                            >
                                {Icon && <Icon className="h-8 w-8 text-primary" />}
                                <div className="flex flex-col">
                                    <h3 className="font-semibold">{category.name}</h3>
                                    <p className="text-xs text-muted-foreground">{category.description}</p>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

             <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">{selectedCategory} Vendors</h2>
                {vendorsLoading ? (
                     <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-80 animate-pulse bg-muted"></Card>)}
                    </div>
                ) : filteredVendors.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredVendors.map(vendor => {
                             const vendorImage = PlaceHolderImages.find(img => img.id === vendor.imageId);
                             return (
                                <Card key={vendor.id} className="overflow-hidden group">
                                    <div className="relative">
                                        <Image 
                                            src={vendorImage?.imageUrl || "https://picsum.photos/seed/placeholder/400/300"} 
                                            alt={vendorImage?.description || vendor.name}
                                            width={400}
                                            height={300}
                                            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background"
                                            onClick={() => toggleFavorite(vendor.id)}
                                        >
                                            <Heart className={cn("w-5 h-5", favorited[vendor.id] ? "text-red-500 fill-current" : "text-gray-500")} />
                                        </Button>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{vendor.name}</h3>
                                                <p className="text-sm text-muted-foreground">{vendor.category}</p>
                                            </div>
                                            {vendor.isFeatured && <Badge>Featured</Badge>}
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm font-bold">{vendor.priceRange}</p>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                                                <span className="text-muted-foreground">({vendor.reviewCount})</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No vendors found for "{selectedCategory}"{searchTerm && ` with name "${searchTerm}"`}.</p>
                    </div>
                )}
            </div>
        </>
    );
}

    