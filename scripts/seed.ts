import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data for categories
const categories = [
    { name: 'Electronics', description: 'Gadgets and electronic devices' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Kitchen', description: 'Products for your home' },
    { name: 'Sports & Outdoors', description: 'Equipment for sports and outdoor activities' },
    { name: 'Beauty & Personal Care', description: 'Cosmetics and personal care items' }
];

// Sample users (will be created with Supabase auth)
const users = [
    { email: 'customer@example.com', password: 'password123', full_name: 'John Customer', role: 'customer' },
    { email: 'admin@example.com', password: 'admin123', full_name: 'Admin User', role: 'admin' }
];

// Seed function for the database
const seed = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Create categories
        console.log('Creating categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .upsert(categories, { onConflict: 'name' })
            .select('*');

        if (categoriesError) {
            throw categoriesError;
        }
        console.log(`✅ Created ${categoriesData.length} categories`);

        // Create users via auth
        console.log('Creating users...');
        for (const user of users) {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('*')
                .eq('full_name', user.full_name)
                .maybeSingle();

            if (!existingUser) {
                // Create user with auth
                const { data: authUser, error: authError } = await supabase.auth.signUp({
                    email: user.email,
                    password: user.password,
                });

                if (authError) {
                    console.error(`Error creating user ${user.email}:`, authError);
                    continue;
                }

                // Create profile
                if (authUser.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: authUser.user.id,
                            full_name: user.full_name,
                            role: user.role,
                        });

                    if (profileError) {
                        console.error(`Error creating profile for ${user.email}:`, profileError);
                    } else {
                        console.log(`✅ Created user: ${user.email}`);
                    }
                }
            } else {
                console.log(`User ${user.email} already exists, skipping`);
            }
        }

        // Create sample products
        console.log('Creating products...');

        // Get category IDs for reference
        const categoryLookup = categoriesData.reduce((acc, category) => {
            acc[category.name] = category.id;
            return acc;
        }, {} as Record<string, string>);

        // Sample products data
        const products = [
            {
                id: uuidv4(),
                name: 'Smartphone X Pro',
                description: 'Latest flagship smartphone with advanced camera features and powerful processor.',
                price: 899.99,
                stock: 50,
                category_id: categoryLookup['Electronics'],
                is_featured: true
            },
            {
                id: uuidv4(),
                name: 'Wireless Earbuds',
                description: 'Premium wireless earbuds with noise cancellation and 24-hour battery life.',
                price: 149.99,
                stock: 100,
                category_id: categoryLookup['Electronics'],
                is_featured: true
            },
            {
                id: uuidv4(),
                name: 'Slim Fit Jeans',
                description: 'Comfortable slim fit jeans made with premium denim material.',
                price: 59.99,
                stock: 200,
                category_id: categoryLookup['Clothing'],
                is_featured: false
            },
            {
                id: uuidv4(),
                name: 'Cotton T-Shirt',
                description: 'Soft, breathable cotton t-shirt, perfect for everyday wear.',
                price: 24.99,
                stock: 300,
                category_id: categoryLookup['Clothing'],
                is_featured: true
            },
            {
                id: uuidv4(),
                name: 'Smart Blender',
                description: 'Programmable blender with multiple settings for smoothies, soups, and more.',
                price: 79.99,
                stock: 75,
                category_id: categoryLookup['Home & Kitchen'],
                is_featured: false
            },
            {
                id: uuidv4(),
                name: 'Non-Stick Cookware Set',
                description: 'Complete 10-piece cookware set with durable non-stick coating.',
                price: 129.99,
                stock: 50,
                category_id: categoryLookup['Home & Kitchen'],
                is_featured: true
            },
            {
                id: uuidv4(),
                name: 'Yoga Mat',
                description: 'Extra thick, non-slip yoga mat for comfortable practice.',
                price: 29.99,
                stock: 150,
                category_id: categoryLookup['Sports & Outdoors'],
                is_featured: false
            },
            {
                id: uuidv4(),
                name: 'Mountain Bike',
                description: 'Durable mountain bike with 21 speeds and front suspension.',
                price: 399.99,
                stock: 25,
                category_id: categoryLookup['Sports & Outdoors'],
                is_featured: true
            },
            {
                id: uuidv4(),
                name: 'Face Moisturizer',
                description: 'Hydrating face moisturizer suitable for all skin types.',
                price: 19.99,
                stock: 200,
                category_id: categoryLookup['Beauty & Personal Care'],
                is_featured: false
            },
            {
                id: uuidv4(),
                name: 'Vitamin C Serum',
                description: 'Brightening serum with 20% vitamin C and hyaluronic acid.',
                price: 34.99,
                stock: 120,
                category_id: categoryLookup['Beauty & Personal Care'],
                is_featured: true
            }
        ];

        // Insert products
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .upsert(products, { onConflict: 'name' })
            .select('*');

        if (productsError) {
            throw productsError;
        }
        console.log(`✅ Created ${productsData.length} products`);

        // Create product variations
        console.log('Creating product variations...');

        // Create lookup for products
        const productLookup = productsData.reduce((acc, product) => {
            acc[product.name] = product.id;
            return acc;
        }, {} as Record<string, string>);

        // Define variations for products
        const variations = [
            // Smartphone variations
            {
                product_id: productLookup['Smartphone X Pro'],
                name: 'Storage',
                value: '128GB',
                price_adjustment: 0,
                stock: 30
            },
            {
                product_id: productLookup['Smartphone X Pro'],
                name: 'Storage',
                value: '256GB',
                price_adjustment: 100,
                stock: 15
            },
            {
                product_id: productLookup['Smartphone X Pro'],
                name: 'Color',
                value: 'Black',
                price_adjustment: 0,
                stock: 20
            },
            {
                product_id: productLookup['Smartphone X Pro'],
                name: 'Color',
                value: 'Silver',
                price_adjustment: 0,
                stock: 20
            },
            {
                product_id: productLookup['Smartphone X Pro'],
                name: 'Color',
                value: 'Gold',
                price_adjustment: 20,
                stock: 10
            },

            // Clothing variations
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Size',
                value: 'S',
                price_adjustment: 0,
                stock: 50
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Size',
                value: 'M',
                price_adjustment: 0,
                stock: 50
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Size',
                value: 'L',
                price_adjustment: 0,
                stock: 50
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Size',
                value: 'XL',
                price_adjustment: 0,
                stock: 50
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Color',
                value: 'Blue',
                price_adjustment: 0,
                stock: 100
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                name: 'Color',
                value: 'Black',
                price_adjustment: 0,
                stock: 100
            },

            // T-shirt variations
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Size',
                value: 'S',
                price_adjustment: 0,
                stock: 75
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Size',
                value: 'M',
                price_adjustment: 0,
                stock: 75
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Size',
                value: 'L',
                price_adjustment: 0,
                stock: 75
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Size',
                value: 'XL',
                price_adjustment: 0,
                stock: 75
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Color',
                value: 'White',
                price_adjustment: 0,
                stock: 100
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Color',
                value: 'Black',
                price_adjustment: 0,
                stock: 100
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                name: 'Color',
                value: 'Red',
                price_adjustment: 0,
                stock: 100
            }
        ];

        // Insert variations
        const { data: variationsData, error: variationsError } = await supabase
            .from('product_variations')
            .upsert(variations)
            .select('*');

        if (variationsError) {
            throw variationsError;
        }
        console.log(`✅ Created ${variationsData.length} product variations`);

        // Create product images
        console.log('Creating product images...');

        // Sample image URLs (using placeholder images)
        const images = [
            {
                product_id: productLookup['Smartphone X Pro'],
                url: 'https://placehold.co/600x400?text=Smartphone+X+Pro',
                is_primary: true
            },
            {
                product_id: productLookup['Smartphone X Pro'],
                url: 'https://placehold.co/600x400?text=Smartphone+X+Pro+Back',
                is_primary: false
            },
            {
                product_id: productLookup['Wireless Earbuds'],
                url: 'https://placehold.co/600x400?text=Wireless+Earbuds',
                is_primary: true
            },
            {
                product_id: productLookup['Slim Fit Jeans'],
                url: 'https://placehold.co/600x400?text=Slim+Fit+Jeans',
                is_primary: true
            },
            {
                product_id: productLookup['Cotton T-Shirt'],
                url: 'https://placehold.co/600x400?text=Cotton+T-Shirt',
                is_primary: true
            },
            {
                product_id: productLookup['Smart Blender'],
                url: 'https://placehold.co/600x400?text=Smart+Blender',
                is_primary: true
            },
            {
                product_id: productLookup['Non-Stick Cookware Set'],
                url: 'https://placehold.co/600x400?text=Cookware+Set',
                is_primary: true
            },
            {
                product_id: productLookup['Yoga Mat'],
                url: 'https://placehold.co/600x400?text=Yoga+Mat',
                is_primary: true
            },
            {
                product_id: productLookup['Mountain Bike'],
                url: 'https://placehold.co/600x400?text=Mountain+Bike',
                is_primary: true
            },
            {
                product_id: productLookup['Face Moisturizer'],
                url: 'https://placehold.co/600x400?text=Face+Moisturizer',
                is_primary: true
            },
            {
                product_id: productLookup['Vitamin C Serum'],
                url: 'https://placehold.co/600x400?text=Vitamin+C+Serum',
                is_primary: true
            }
        ];

        // Insert images
        const { data: imagesData, error: imagesError } = await supabase
            .from('product_images')
            .upsert(images)
            .select('*');

        if (imagesError) {
            throw imagesError;
        }
        console.log(`✅ Created ${imagesData.length} product images`);

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
};

// Run the seed function
seed(); 