
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getFirebaseConfig } from '../firebase/config';
import { popularVendors, vendorCategories } from './placeholders';
import 'dotenv/config';

async function seedDatabase() {
    console.log('Starting database seed...');

    try {
        const firebaseConfig = getFirebaseConfig();
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // Seed vendors
        console.log('Seeding vendors...');
        const vendorsRef = ref(database, 'vendors');
        const vendorsData: { [key: string]: any } = {};
        popularVendors.forEach(vendor => {
            vendorsData[vendor.id] = vendor;
        });
        await set(vendorsRef, vendorsData);
        console.log('Vendors seeded successfully.');

        // Seed vendor categories
        console.log('Seeding vendor categories...');
        const categoriesRef = ref(database, 'vendorCategories');
        const categoriesData: { [key: string]: any } = {};
        vendorCategories.forEach(category => {
            categoriesData[category.id] = category;
        });
        await set(categoriesRef, categoriesData);
        console.log('Vendor categories seeded successfully.');

        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Since the script is short-lived, we might not need to explicitly close the connection,
        // but in a long-running script, you would.
        process.exit(0);
    }
}

seedDatabase();
