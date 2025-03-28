import supabase from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { clearCart, getCartItems } from './cart';
import { Json } from '@/types/supabase';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type CreateOrderInput = {
    userId: string;
    shipping_address: string;
    payment_method: string;
    coupon_code?: string;
    notes?: string;
};

export const createOrder = async (input: CreateOrderInput) => {
    const { userId, shipping_address, payment_method, coupon_code, notes } = input;

    // Get cart items
    const cartItems = await getCartItems(userId);

    if (cartItems.length === 0) {
        throw new Error('Cart is empty');
    }

    // Get coupon if provided
    let couponId = null;
    if (coupon_code) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('id')
            .eq('code', coupon_code)
            .single();

        if (coupon) {
            couponId = coupon.id;
        }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            shipping_address,
            payment_method,
            coupon_id: couponId,
            notes,
            status: 'pending',
            payment_status: 'unpaid',
        })
        .select()
        .single();

    if (orderError) {
        throw orderError;
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        // @ts-ignore - we know product exists from the join
        product_name: item.product.name,
        // @ts-ignore - we know product exists from the join
        price: item.product.price,
        quantity: item.quantity,
        variations: item.variations as Json,
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        // If error creating items, delete the order and throw
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
    }

    // Create mock payment transaction
    const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
            order_id: order.id,
            amount: order.total_price,
            status: 'completed', // For mock purposes, all payments succeed
            payment_method,
            payment_details: { mock: true, timestamp: new Date().toISOString() },
        });

    if (paymentError) {
        throw paymentError;
    }

    // Update order status to reflect payment
    const { error: updateError } = await supabase
        .from('orders')
        .update({
            payment_status: 'paid',
            status: 'processing',
        })
        .eq('id', order.id);

    if (updateError) {
        throw updateError;
    }

    // Clear cart
    await clearCart(userId);

    return order;
};

export const getOrders = async (userId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

export const getOrderById = async (orderId: string, userId?: string) => {
    let query = supabase
        .from('orders')
        .select(`
      *,
      order_items(*)
    `)
        .eq('id', orderId);

    // If userId provided, ensure user owns the order
    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) {
        throw error;
    }

    return data;
};

export const cancelOrder = async (orderId: string, userId: string) => {
    // Only allow cancellation of pending or processing orders
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    const { data, error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
        })
        .eq('id', orderId)
        .eq('user_id', userId)
        .select();

    if (error) {
        throw error;
    }

    return data[0];
}; 