import { create } from 'zustand';
import { Json } from '@/types/supabase';
import * as cartApi from '@/api/cart';

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    variations?: Json;
    product?: {
        id: string;
        name: string;
        price: number;
        stock: number;
        product_images?: {
            url: string;
            is_primary: boolean;
        }[];
    };
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    total: number;

    // Actions
    fetchCart: (userId: string) => Promise<void>;
    addToCart: (userId: string, productId: string, quantity?: number, variations?: Json) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: (userId: string) => Promise<void>;
    calculateTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isLoading: false,
    total: 0,

    fetchCart: async (userId: string) => {
        try {
            set({ isLoading: true });
            const cartItems = await cartApi.getCartItems(userId);
            const total = cartItems.reduce((acc, item) => {
                // @ts-ignore - product is available from the joined query
                return acc + (item.product.price * item.quantity);
            }, 0);

            set({ items: cartItems, total, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            set({ isLoading: false });
        }
    },

    addToCart: async (userId: string, productId: string, quantity = 1, variations?: Json) => {
        try {
            set({ isLoading: true });
            await cartApi.addToCart({ userId, productId, quantity, variations });
            await get().fetchCart(userId);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    updateQuantity: async (itemId: string, quantity: number) => {
        try {
            set({ isLoading: true });
            const updatedItem = await cartApi.updateCartItemQuantity({ cartItemId: itemId, quantity });

            set(state => {
                const updatedItems = state.items.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                );
                return {
                    items: updatedItems,
                    total: get().calculateTotal(),
                    isLoading: false
                };
            });
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    removeItem: async (itemId: string) => {
        try {
            set({ isLoading: true });
            await cartApi.removeFromCart(itemId);

            set(state => {
                const updatedItems = state.items.filter(item => item.id !== itemId);
                return {
                    items: updatedItems,
                    total: updatedItems.reduce((acc, item) => {
                        // @ts-ignore - product is available from the joined query
                        return acc + (item.product.price * item.quantity);
                    }, 0),
                    isLoading: false
                };
            });
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    clearCart: async (userId: string) => {
        try {
            set({ isLoading: true });
            await cartApi.clearCart(userId);
            set({ items: [], total: 0, isLoading: false });
        } catch (error) {
            console.error('Failed to clear cart:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    calculateTotal: () => {
        const { items } = get();
        return items.reduce((acc, item) => {
            // @ts-ignore - product is available from the joined query
            return acc + (item.product.price * item.quantity);
        }, 0);
    }
})); 