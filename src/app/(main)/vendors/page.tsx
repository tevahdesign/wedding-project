

'use client'

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, SlidersHorizontal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/app/page-header';
import { useAuth, useDatabase, useFirestore } from '@/firebase';
import { useList } from '@/firebase/database/use-list';
import { ref } from 'firebase/database';
import type { Icon } from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { collection, deleteDoc, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';


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
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // Fetch categories and vendors from Firebase
    const categoriesRef = useMemo(() => database ? ref(database, 'vendorCategories') : null, [database]);
    const { data: categories, loading: categoriesLoading } = useList<VendorCategory>(categoriesRef);
    
    const vendorsRef = useMemo(() => database ? ref(database, 'vendors') : null, [database]);
    const { data: vendors, loading: vendorsLoading } = useList<Vendor>(vendorsRef);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [favorited, setFavorited] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user || !firestore) return;
        const savedVendorsRef = collection(firestore, `users/${user.uid}/savedVendors`);
        const unsubscribe = onSnapshot(savedVendorsRef, (snapshot) => {
            const savedIds = snapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = true;
                return acc;
            }, {} as Record<string, boolean>);
            setFavorited(savedIds);
        });
        return () => unsubscribe();
    }, [user, firestore]);

    const toggleFavorite = async (e: React.MouseEvent, vendorId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You need to be logged in to save vendors.',
            });
            return;
        }

        const savedVendorRef = doc(firestore, `users/${user.uid}/savedVendors/${vendorId}`);
        const isFavorited = favorited[vendorId];

        try {
            if (isFavorited) {
                await deleteDoc(savedVendorRef);
                toast({ title: 'Vendor removed from your list.' });
            } else {
                await setDoc(savedVendorRef, { 
                    vendorId: vendorId,
                    savedAt: serverTimestamp() 
                });
                toast({ title: 'Vendor added to your list!' });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update your vendor list.',
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
                             const isFavorited = favorited[vendor.id];
                             return (
                                <Card key={vendor.id} className="overflow-hidden group cursor-pointer flex flex-col">
                                    <Link href={`/vendors/${vendor.id}`} className="block h-full">
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
                                                <Button
                                                    size="sm"
                                                    variant={isFavorited ? 'secondary' : 'default'}
                                                    className="w-full mt-3"
                                                    onClick={(e) => toggleFavorite(e, vendor.id)}
                                                    disabled={isFavorited}
                                                >
                                                    {isFavorited ? 'Added' : (<><Plus className="mr-2 h-4 w-4" /> Add</>)}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Link>
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

    