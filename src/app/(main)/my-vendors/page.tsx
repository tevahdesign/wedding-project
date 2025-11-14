
'use client'

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Search, Star, Store } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

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
};

export default function MyVendorsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [savedVendors, setSavedVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const savedVendorsRef = collection(firestore, `users/${user.uid}/savedVendors`);
        
        const unsubscribe = onSnapshot(savedVendorsRef, async (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.id);
            
            if (ids.length === 0) {
                setSavedVendors([]);
                setLoading(false);
                return;
            }

            try {
                const vendorsRef = collection(firestore, 'vendors');
                const vendorPromises = [];
                // Firestore 'in' queries are limited to 30 elements.
                // If the user can save more, we need to batch the requests.
                const MAX_IN_QUERIES = 30;
                for (let i = 0; i < ids.length; i += MAX_IN_QUERIES) {
                    const chunk = ids.slice(i, i + MAX_IN_QUERIES);
                    const vendorsQuery = query(vendorsRef, where('__name__', 'in', chunk));
                    vendorPromises.push(getDocs(vendorsQuery));
                }
                
                const querySnapshots = await Promise.all(vendorPromises);
                const vendorsList: Vendor[] = [];
                querySnapshots.forEach(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        vendorsList.push({ id: doc.id, ...doc.data() } as Vendor);
                    });
                });

                setSavedVendors(vendorsList);
            } catch (error) {
                console.error("Error fetching saved vendors:", error);
                setSavedVendors([]);
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error("Error listening to saved vendors:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);
    
    return (
        <div className="flex flex-col flex-1 pb-20">
            <PageHeader title="My Vendors" showBackButton>
                <Button asChild>
                    <Link href="/vendors">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Discover Vendors
                    </Link>
                </Button>
            </PageHeader>

             <div className="p-4 pt-8">
                {loading ? (
                     <div className="flex justify-center items-center gap-2 text-muted-foreground py-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading your vendors...</span>
                    </div>
                ) : savedVendors.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedVendors.map(vendor => (
                            <Link href={`/vendors/${vendor.id}`} key={vendor.id} className="overflow-hidden group cursor-pointer">
                                <Card className="h-full border-none shadow-sm transition-shadow hover:shadow-xl rounded-xl">
                                <CardContent className="p-0">
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
                                    <div className="p-3">
                                    <h3 className="font-bold text-base truncate">{vendor.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{vendor.category}</p>
                                    <p className="text-sm font-bold mt-1">{vendor.priceRange}</p>
                                    </div>
                                </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <div className="flex flex-col items-center gap-4">
                            <Store className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="text-xl font-semibold">Your Vendor List is Empty</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Start exploring vendors and save your favorites here for easy access.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href="/vendors">
                                    <Search className="mr-2 h-4 w-4" />
                                     Discover Vendors
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
