
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
        </>
    );
}
