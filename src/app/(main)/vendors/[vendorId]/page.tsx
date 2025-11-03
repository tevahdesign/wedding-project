
"use client"

import { useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ref } from 'firebase/database';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useDatabase } from '@/firebase';
import { useObjectValue } from '@/firebase/database/use-object-value';
import { PageHeader } from '@/components/app/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, MessageCircle, Loader2 } from 'lucide-react';

type Service = {
    name: string;
    price: number;
}

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
    galleryImageIds?: string[];
    services?: Service[];
};

export default function VendorDetailPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;
    const database = useDatabase();

    const vendorRef = useMemo(() => {
        if (!database || !vendorId) return null;
        return ref(database, `vendors/${vendorId}`);
    }, [database, vendorId]);

    const { data: vendor, loading } = useObjectValue<Vendor>(vendorRef);

    const allImages = useMemo(() => {
        if (!vendor) return [];
        const images = [];
        if (vendor.imageId) images.push(vendor.imageId);
        if (vendor.galleryImageIds) images.push(...vendor.galleryImageIds);
        return images;
    }, [vendor]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col flex-1 pb-20">
                <PageHeader title="Vendor Not Found" showBackButton />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">The vendor you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 pb-20 bg-muted/30">
            <PageHeader title={vendor.name} showBackButton />

            <div className='-mt-2'>
                <Carousel className="w-full">
                    <CarouselContent>
                        {allImages.length > 0 ? allImages.map((img, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-video">
                                    <Image
                                        src={img}
                                        alt={`${vendor.name} gallery image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        )) : (
                             <CarouselItem>
                                <div className="relative aspect-video bg-muted flex items-center justify-center">
                                   <p className="text-muted-foreground">No images</p>
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    {allImages.length > 1 && (
                      <>
                        <CarouselPrevious className="ml-16" />
                        <CarouselNext className="mr-16" />
                      </>
                    )}
                </Carousel>
            </div>

            <div className="p-4 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                         <div>
                            {vendor.isFeatured && <Badge className="mb-2">Featured</Badge>}
                            <CardTitle className="text-2xl">{vendor.name}</CardTitle>
                            <p className="text-md text-muted-foreground">{vendor.category}</p>
                        </div>
                        {vendor.logoImageId && (
                            <Image
                                src={vendor.logoImageId}
                                alt={`${vendor.name} logo`}
                                width={64}
                                height={64}
                                className="rounded-lg object-contain"
                            />
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">({vendor.reviewCount} reviews)</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{vendor.location}</span>
                            </div>
                        </div>
                         <p className="text-lg font-bold text-primary">{vendor.priceRange}</p>
                    </CardContent>
                </Card>

                {vendor.services && vendor.services.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vendor.services.map((service, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <p>{service.name}</p>
                                        <p className="font-semibold text-primary">₹{service.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                 <Card>
                    <CardHeader>
                        <CardTitle>About {vendor.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Detailed information about this vendor is not yet available. Please check back later or contact the vendor directly for more details.
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-auto p-4 bg-background border-t sticky bottom-0">
                <div className="flex gap-4">
                    <Button variant="outline" className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" /> Message
                    </Button>
                    <Button className="w-full">
                        <Phone className="mr-2 h-4 w-4" /> Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
