
'use client'

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Search, Star, Store, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { useAuth, useDatabase } from '@/firebase';
import Link from 'next/link';
import { ref, remove } from 'firebase/database';
import { useList } from '@/firebase/database/use-list';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VendorForm } from './vendor-form';

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
    const database = useDatabase();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const myVendorsRef = useMemo(() => {
        if (!user || !database) return null;
        return ref(database, `users/${user.uid}/myVendors`);
    }, [user, database]);

    const { data: savedVendors, loading } = useList<Vendor>(myVendorsRef);

    const handleDeleteVendor = async (e: React.MouseEvent, vendorId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !database) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You need to be logged in to modify your vendors.',
            });
            return;
        }

        const vendorRef = ref(database, `users/${user.uid}/myVendors/${vendorId}`);
        try {
            await remove(vendorRef);
            toast({
                title: 'Vendor Removed',
                description: 'The vendor has been removed from your list.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not remove the vendor. Please try again.',
            });
        }
    };
    
    return (
        <div className="flex flex-col flex-1 pb-20">
            <PageHeader title="My Vendors" showBackButton>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/vendors">
                            <Search className="mr-2 h-4 w-4" />
                            Discover
                        </Link>
                    </Button>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Vendor
                    </Button>
                </div>
            </PageHeader>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Add Custom Vendor</DialogTitle>
                    </DialogHeader>
                    <VendorForm setDialogOpen={setIsFormOpen} />
                </DialogContent>
            </Dialog>

             <div className="p-4 pt-8">
                {loading ? (
                     <div className="flex justify-center items-center gap-2 text-muted-foreground py-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading your vendors...</span>
                    </div>
                ) : savedVendors && savedVendors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedVendors.map(vendor => (
                            <Link href={`/v/${vendor.id}`} key={vendor.id} className="overflow-hidden group cursor-pointer">
                                <Card className="h-full border shadow-sm transition-shadow hover:shadow-xl rounded-xl">
                                <CardContent className="p-0">
                                    <div className="relative">
                                    <Image
                                        src={vendor.imageId || "https://picsum.photos/seed/placeholder/400/300"}
                                        alt={vendor.name}
                                        width={400}
                                        height={400}
                                        className="object-cover w-full aspect-square rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                                    />
                                     <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDeleteVendor(e, vendor.id)}
                                        aria-label="Remove vendor"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="font-semibold">{vendor.rating?.toFixed(1)}</span>
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

