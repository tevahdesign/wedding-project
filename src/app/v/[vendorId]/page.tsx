
"use client"

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react';
import { get, ref } from 'firebase/database';

import { useAuth, useDatabase } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { set, remove, onValue } from 'firebase/database';

type Service = {
    name: string;
    price: number;
}

type Vendor = {
    id: string;
    name:string;
    category: string;
    location: string;
    priceRange: string;
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    imageId: string;
    logoImageId?: string;
    galleryImageIds?: string[];
    services?: Service[];
    isCustom?: boolean;
};

export default function PublicVendorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.vendorId as string;
    const database = useDatabase();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [isFavorited, setIsFavorited] = useState(false);
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        if (!database || !vendorId) return;

        const fetchVendor = async () => {
            setLoading(true);
            // 1. Try fetching from public vendors
            const publicVendorRef = ref(database, `vendors/${vendorId}`);
            let snapshot = await get(publicVendorRef);

            if (snapshot.exists()) {
                setVendor({ id: snapshot.key, ...snapshot.val() });
                setLoading(false);
                return;
            }

            // 2. If not found and user is logged in, try fetching from user's private vendors
            if (user) {
                const privateVendorRef = ref(database, `users/${user.uid}/myVendors/${vendorId}`);
                snapshot = await get(privateVendorRef);
                if (snapshot.exists()) {
                    setVendor({ id: snapshot.key, ...snapshot.val() });
                    setLoading(false);
                    return;
                }
            }

            // 3. If still not found, set vendor to null
            setVendor(null);
            setLoading(false);
        };

        fetchVendor();
    }, [database, vendorId, user]);


    useEffect(() => {
        if (!user || !database || !vendorId) return;
        const savedVendorRef = ref(database, `users/${user.uid}/myVendors/${vendorId}`);
        const unsubscribe = onValue(savedVendorRef, (snapshot) => {
            setIsFavorited(snapshot.exists());
        });
        return () => unsubscribe();
    }, [user, database, vendorId]);


    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !database || !vendor) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You need to be logged in to save vendors.',
            });
            router.push('/login');
            return;
        }

        const savedVendorRef = ref(database, `users/${user.uid}/myVendors/${vendorId}`);
        try {
            if (isFavorited) {
                await remove(savedVendorRef);
                toast({ title: 'Vendor removed from your list.' });
            } else {
                await set(savedVendorRef, vendor);
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


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col flex-1 pb-20">
                <div className="p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-semibold mt-2">Vendor Not Found</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">The vendor you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 bg-muted/20 pb-28">
            <div className="relative w-full h-[40vh] bg-muted">
                <Image
                    src={vendor.imageId}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                <div className="absolute top-4 left-4 z-10">
                     <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </div>
                <div className="absolute top-4 right-4 z-10">
                     <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white" onClick={toggleFavorite} disabled={vendor.isCustom}>
                        <Heart className={cn("h-6 w-6", isFavorited && "fill-red-500 text-red-500")} />
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
                    {vendor.isFeatured && <Badge className="mb-2 backdrop-blur-sm bg-white/20 border-none">Featured</Badge>}
                    {vendor.isCustom && <Badge className="mb-2 backdrop-blur-sm bg-primary/80 border-none">My Private Vendor</Badge>}

                    <h1 className="text-3xl font-bold">{vendor.name}</h1>
                    <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                            <span className="text-gray-300">({vendor.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="about" className="w-full">
                 <TabsList className="grid w-full grid-cols-4 bg-background sticky top-0 z-10 rounded-none h-14">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <div className='p-4 space-y-4'>
                    <TabsContent value="about" className="m-0 space-y-4">
                        <div className='bg-background rounded-lg p-4'>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-5 h-5" />
                                <span className="text-base">{vendor.location}</span>
                            </div>
                            <div className="mt-4">
                                 <p className="text-lg font-bold text-primary">{vendor.priceRange}</p>
                                 <p className="text-xs text-muted-foreground">Typical price range</p>
                            </div>
                        </div>

                         <div className='bg-background rounded-lg p-4'>
                            <h2 className="font-bold text-lg mb-2">About {vendor.name}</h2>
                             <p className="text-muted-foreground">
                                Detailed information about this vendor is not yet available. Please check back later or contact the vendor directly for more details.
                            </p>
                        </div>
                    </TabsContent>
                    <TabsContent value="services" className="m-0">
                         <div className='bg-background rounded-lg p-4'>
                            <h2 className="font-bold text-lg mb-4">Services & Pricing</h2>
                             {vendor.services && vendor.services.length > 0 ? (
                                <div className="space-y-4">
                                    {vendor.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0">
                                            <p>{service.name}</p>
                                            <p className="font-semibold text-primary">₹{service.price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No specific services listed.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="gallery" className="m-0">
                        <div className='bg-background rounded-lg p-4'>
                            <h2 className="font-bold text-lg mb-4">Gallery</h2>
                            {vendor.galleryImageIds && vendor.galleryImageIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {vendor.galleryImageIds.map((imageUrl, index) => (
                                        <div key={index} className="relative aspect-square w-full h-auto rounded-lg overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt={`Gallery image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">This vendor hasn't uploaded any gallery images yet.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="reviews" className="m-0">
                        <div className='bg-background rounded-lg p-4'>
                            <h2 className="font-bold text-lg mb-4">{vendor.reviewCount} Reviews</h2>
                             <div className="text-center py-8 text-muted-foreground">
                                <p>Reviews are not yet available for this vendor.</p>
                             </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
                 <div className="flex gap-4 p-2 bg-background/70 backdrop-blur-2xl border border-white/20 rounded-full shadow-lg">
                    <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
                        <MessageCircle className="mr-2 h-4 w-4" /> Message
                    </Button>
                    <Button className="w-full rounded-full">
                        <Phone className="mr-2 h-4 w-4" /> Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
