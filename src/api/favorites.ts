import supabase from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Favorite = Database['public']['Tables']['favorites']['Row'];

export const getFavorites = async (userId: string) => {
    const { data, error } = await supabase
        .from('favorites')
        .select(`
      *,
      product:products(
        id,
        name,
        price,
        product_images(url, is_primary)
      )
    `)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return data;
};

export const addToFavorites = async (userId: string, productId: string) => {
    // Check if already favorited
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (existing && existing.length > 0) {
        // Already favorited
        return existing[0];
    }

    const { data, error } = await supabase
        .from('favorites')
        .insert({
            user_id: userId,
            product_id: productId,
        })
        .select();

    if (error) {
        throw error;
    }

    return data[0];
};

export const removeFromFavorites = async (userId: string, productId: string) => {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        throw error;
    }

    return true;
};

export const isProductFavorited = async (userId: string, productId: string) => {
    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        throw error;
    }

    return data && data.length > 0;
}; 