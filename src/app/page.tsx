

import { get, ref } from "firebase/database";
import { initializeFirebase } from "@/firebase";
import { HomePageClient } from "./(main)/home-client";
import { getAuth } from "firebase/auth";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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

async function getVendorsAndCategories() {
    const { database } = initializeFirebase();
    if (!database) {
        return { vendors: [], categories: [] };
    }

    try {
        const vendorsRef = ref(database, 'vendors');
        const categoriesRef = ref(database, 'vendorCategories');

        const [vendorsSnapshot, categoriesSnapshot] = await Promise.all([
            get(vendorsRef),
            get(categoriesRef)
        ]);

        const vendors: Vendor[] = [];
        if (vendorsSnapshot.exists()) {
            const vendorsData = vendorsSnapshot.val();
            Object.keys(vendorsData).forEach(key => {
                vendors.push({ id: key, ...vendorsData[key] });
            });
        }

        const categories: VendorCategory[] = [];
        if (categoriesSnapshot.exists()) {
            const categoriesData = categoriesSnapshot.val();
            Object.keys(categoriesData).forEach(key => {
                 categories.push({ id: key, ...categoriesData[key] });
            });
        }

        return { vendors, categories };
    } catch (error) {
        console.error("Error fetching data from Realtime Database:", error);
        return { vendors: [], categories: [] };
    }
}


export default async function RootPage() {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (userCookie) {
        try {
            const user = JSON.parse(userCookie.value);
            if (user && user.uid) {
                redirect('/dashboard');
            }
        } catch (e) {
            // Invalid cookie, treat as logged out
        }
    }

  const { vendors, categories } = await getVendorsAndCategories();

  return <HomePageClient vendors={vendors} categories={categories} />;
}
