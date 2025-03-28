import supabase from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Json } from '@/types/supabase';

export type CartItem = Database['public']['Tables']['carts']['Row'];

export const getCartItems = async (userId: string) => {
    const { data, error } = await supabase
        .from('carts')
        .select(`
      *,
      product:products(
        id,
        name,
        price,
        stock,
        product_images(url, is_primary)
      )
    `)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return data;
};

export const addToCart = async ({
    userId,
    productId,
    quantity = 1,
    variations,
}: {
    userId: string;
    productId: string;
    quantity?: number;
    variations?: Json;
}) => {
    // Check if item already exists in cart
    const { data: existingItems } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('variations', variations || null);

    if (existingItems && existingItems.length > 0) {
        // Update quantity of existing item
        const { data, error } = await supabase
            .from('carts')
            .update({
                quantity: existingItems[0].quantity + quantity,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingItems[0].id)
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    } else {
        // Add new item to cart
        const { data, error } = await supabase
            .from('carts')
            .insert({
                user_id: userId,
                product_id: productId,
                quantity,
                variations,
            })
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    }
};

export const updateCartItemQuantity = async ({
    cartItemId,
    quantity,
}: {
    cartItemId: string;
    quantity: number;
}) => {
    const { data, error } = await supabase
        .from('carts')
        .update({
            quantity,
            updated_at: new Date().toISOString(),
        })
        .eq('id', cartItemId)
        .select();

    if (error) {
        throw error;
    }

    return data[0];
};

export const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartItemId);

    if (error) {
        throw error;
    }

    return true;
};

export const clearCart = async (userId: string) => {
    const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return true;
};

export const getCartTotal = async (userId: string) => {
    const { data: cartItems } = await getCartItems(userId);

    return cartItems.reduce((total, item) => {
        // @ts-ignore - product is available from the joined query
        const price = item.product.price;
        return total + (price * item.quantity);
    }, 0);
}; 