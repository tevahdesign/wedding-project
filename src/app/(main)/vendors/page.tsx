

'use client'

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, SlidersHorizontal, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/app/page-header';
import { useAuth, useDatabase } from '@/firebase';
import { useList } from '@/firebase/database/use-list';
import { ref, set, onValue, remove } from 'firebase/database';
import type { Icon } from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


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
    const { toast } = useToast();
    
    // Fetch categories and vendors from Firebase
    const categoriesRef = useMemo(() => database ? ref(database, 'vendorCategories') : null, [database]);
    const { data: categories, loading: categoriesLoading } = useList<VendorCategory>(categoriesRef);
    
    const vendorsRef = useMemo(() => database ? ref(database, 'vendors') : null, [database]);
    const { data: vendors, loading: vendorsLoading } = useList<Vendor>(vendorsRef);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [savedVendorIds, setSavedVendorIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user || !database) return;
        const savedVendorsRef = ref(database, `users/${user.uid}/myVendors`);
        const unsubscribe = onValue(savedVendorsRef, (snapshot) => {
            const savedIds = snapshot.val() || {};
            const idMap = Object.keys(savedIds).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as Record<string, boolean>)
            setSavedVendorIds(idMap);
        });
        return () => unsubscribe();
    }, [user, database]);

    const handleAddVendor = async (e: React.MouseEvent, vendor: Vendor) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !database) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You need to be logged in to save vendors.',
            });
            return;
        }

        const savedVendorRef = ref(database, `users/${user.uid}/myVendors/${vendor.id}`);
        
        try {
            await set(savedVendorRef, vendor);
            toast({ title: 'Vendor added to your list!' });
        } catch (error) {
            console.error('Error saving vendor:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add vendor to your list.',
            });
        }
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
        <div className="flex flex-col flex-1 pb-20">
            <PageHeader title="Discover Vendors" showBackButton>
                <Button variant="ghost" size="icon">
                    <SlidersHorizontal className="h-5 w-5" />
                </Button>
            </PageHeader>

            <div className="px-4 pb-4 sticky top-16 z-10 bg-background/80 backdrop-blur-sm -mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for venues, photographers..." 
                        className="pl-10 h-12 rounded-lg bg-card"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            
                <div className="flex space-x-3 overflow-x-auto whitespace-nowrap pt-4 pb-2 -mx-4 px-4">
                    {categoriesLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>)
                    ) : (
                        allCategories.map(category => {
                            const Icon = lucideIcons[category.icon] as Icon;
                            return (
                                <Button 
                                    key={category.id} 
                                    variant={selectedCategory === category.name ? 'default' : 'secondary'}
                                    className="rounded-full shrink-0"
                                    onClick={() => setSelectedCategory(category.name)}
                                >
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {category.name}
                                </Button>
                            )
                        })
                    )}
                </div>
            </div>

             <div className="p-4 pt-8">
                <h2 className="text-xl font-bold mb-4">{selectedCategory} Vendors</h2>
                {vendorsLoading ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <Card key={i} className="h-64 animate-pulse bg-muted"></Card>)}
                    </div>
                ) : filteredVendors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredVendors.map(vendor => {
                             const isSaved = savedVendorIds[vendor.id];
                             return (
                                <Card key={vendor.id} className="overflow-hidden group cursor-pointer flex flex-col">
                                    <div className="block h-full">
                                        <CardContent className="p-0 flex flex-col h-full">
                                            <div className="relative">
                                                <Image
                                                    src={vendor.imageId || "https://picsum.photos/seed/placeholder/400/300"}
                                                    alt={vendor.name}
                                                    width={400}
                                                    height={400}
                                                    className="object-cover w-full aspect-square rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>{vendor.reviewCount}</span>
                                                </div>
                                            </div>
                                            <div className="p-3 flex flex-col flex-grow">
                                                <h3 className="font-bold text-base truncate">{vendor.name}</h3>
                                                <p className="text-sm text-muted-foreground truncate">{vendor.category}</p>
                                                <p className="text-sm font-bold mt-1">{vendor.priceRange}</p>
                                                <div className="flex-grow"></div>
                                                <div className="flex gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        variant={isSaved ? 'secondary' : 'default'}
                                                        className="w-full"
                                                        onClick={(e) => handleAddVendor(e, vendor)}
                                                        disabled={isSaved}
                                                    >
                                                        {isSaved ? 'Added' : (<><Plus className="mr-2 h-4 w-4" /> Add</>)}
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline" className="w-full">
                                                        <Link href={`/vendors/${vendor.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
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
        </div>
    );
}
