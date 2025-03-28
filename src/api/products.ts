import supabase from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductSummary = Database['public']['Views']['product_summary']['Row'];
export type ProductVariation = Database['public']['Tables']['product_variations']['Row'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];

export const getProducts = async (options?: {
    limit?: number;
    offset?: number;
    category_id?: string;
    search?: string;
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    featured_only?: boolean;
}) => {
    let query = supabase
        .from('product_summary')
        .select('*');

    // Apply filters
    if (options?.category_id) {
        query = query.eq('category_id', options.category_id);
    }

    if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.featured_only) {
        query = query.eq('is_featured', true);
    }

    // Apply sorting
    if (options?.sort_by) {
        switch (options.sort_by) {
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'newest':
                query = query.order('id', { ascending: false });
                break;
            case 'popular':
                query = query.order('avg_rating', { ascending: false, nullsFirst: false });
                break;
            default:
                query = query.order('id', { ascending: false });
                break;
        }
    } else {
        // Default sorting by ID (newest first)
        query = query.order('id', { ascending: false });
    }

    // Apply pagination
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        throw error;
    }

    return { data, count };
};

export const getProductById = async (id: string) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getProductDetails = async (id: string) => {
    // Get product data
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(name)
    `)
        .eq('id', id)
        .single();

    if (productError) {
        throw productError;
    }

    // Get product variations
    const { data: variations, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', id);

    if (variationsError) {
        throw variationsError;
    }

    // Get product images
    const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('is_primary', { ascending: false });

    if (imagesError) {
        throw imagesError;
    }

    // Get product reviews (without joining profiles)
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

    if (reviewsError) {
        throw reviewsError;
    }

    // Fetch profile information separately for reviews if there are any reviews
    let reviewsWithProfiles = [...reviews];
    if (reviews.length > 0) {
        // Get unique user IDs from reviews
        const userIds = [...new Set(reviews.map(review => review.user_id))];

        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        if (!profilesError && profiles) {
            // Map profiles to reviews
            reviewsWithProfiles = reviews.map(review => {
                const profile = profiles.find(p => p.id === review.user_id);
                return {
                    ...review,
                    profile_info: profile || null
                };
            });
        }
    }

    // Calculate average rating
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
        ...product,
        variations,
        images,
        reviews: reviewsWithProfiles,
        avgRating,
    };
};

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        throw error;
    }

    return data;
};

export const getProductReviews = async (productId: string) => {
    // Get reviews without joining profiles
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (reviewsError) {
        throw reviewsError;
    }

    // Fetch profile information separately
    let reviewsWithProfiles = [...reviews];
    if (reviews.length > 0) {
        // Get unique user IDs from reviews
        const userIds = [...new Set(reviews.map(review => review.user_id))];

        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        if (!profilesError && profiles) {
            // Map profiles to reviews
            reviewsWithProfiles = reviews.map(review => {
                const profile = profiles.find(p => p.id === review.user_id);
                return {
                    ...review,
                    profile_info: profile || null
                };
            });
        }
    }

    return reviewsWithProfiles;
};

export const addProductReview = async ({
    productId,
    userId,
    rating,
    comment,
}: {
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
}) => {
    const { data, error } = await supabase
        .from('reviews')
        .insert({
            product_id: productId,
            user_id: userId,
            rating,
            comment,
        })
        .select();

    if (error) {
        throw error;
    }

    return data[0];
}; 