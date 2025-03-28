import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart } from '@/api/cart';
import { useAuthStore } from '@/store/authStore';

type CartItemType = {
    id: string;
    quantity: number;
    variations: any;
    product: {
        id: string;
        name: string;
        price: number;
        stock: number;
        product_images: { url: string; is_primary: boolean }[];
    };
};

const Cart: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<CartItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingItem, setUpdatingItem] = useState<string | null>(null);

    // Fetch cart items
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) {
                setCartItems([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getCartItems(user.id);
                setCartItems(data as CartItemType[]);
                setError(null);
            } catch (err) {
                console.error('Error fetching cart items:', err);
                setError('Failed to load your cart. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [user]);

    // Handle quantity update
    const handleQuantityChange = async (cartItemId: string, newQuantity: number, maxStock: number) => {
        if (newQuantity < 1 || newQuantity > maxStock) return;

        try {
            setUpdatingItem(cartItemId);
            await updateCartItemQuantity({ cartItemId, quantity: newQuantity });

            // Update local state
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update quantity. Please try again.');
        } finally {
            setUpdatingItem(null);
        }
    };

    // Handle remove item
    const handleRemoveItem = async (cartItemId: string) => {
        try {
            setUpdatingItem(cartItemId);
            await removeFromCart(cartItemId);

            // Update local state
            setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
        } catch (err) {
            console.error('Error removing item:', err);
            setError('Failed to remove item. Please try again.');
        } finally {
            setUpdatingItem(null);
        }
    };

    // Handle clear cart
    const handleClearCart = async () => {
        if (!user) return;

        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                setLoading(true);
                await clearCart(user.id);
                setCartItems([]);
            } catch (err) {
                console.error('Error clearing cart:', err);
                setError('Failed to clear your cart. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle proceed to checkout
    const handleCheckout = () => {
        navigate('/checkout');
    };

    // Calculate cart totals
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);

    const formatVariations = (variations: any) => {
        if (!variations) return null;

        return Object.entries(variations).map(([key, value]) => (
            <span key={key} className="block text-sm text-gray-500">
                {key}: {String(value)}
            </span>
        ));
    };

    // Render loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    // Render when user is not logged in
    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
                <div className="mt-8 p-8 text-center border rounded-md">
                    <p className="text-gray-600 mb-4">Please sign in to view your cart.</p>
                    <Link
                        to="/login?redirect=/cart"
                        className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="mt-8 p-8 text-center border rounded-md">
                    <p className="text-gray-600 mb-4">Your cart is empty.</p>
                    <Link
                        to="/products"
                        className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="mt-8">
                    <div className="flow-root">
                        <ul className="divide-y divide-gray-200">
                            {cartItems.map((item) => {
                                const image = item.product.product_images.find(img => img.is_primary)?.url ||
                                    item.product.product_images[0]?.url;

                                return (
                                    <li key={item.id} className="py-6 flex">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="ml-4 flex-1 flex flex-col">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        <Link to={`/products/${item.product.id}`} className="hover:text-indigo-600">
                                                            {item.product.name}
                                                        </Link>
                                                    </h3>
                                                    <p className="ml-4 text-lg font-medium text-gray-900">
                                                        ${(item.product.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>

                                                {/* Show variations if any */}
                                                {item.variations && (
                                                    <div className="mt-1">
                                                        {formatVariations(item.variations)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex-1 flex items-end justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.product.stock)}
                                                        disabled={item.quantity <= 1 || updatingItem === item.id}
                                                        className="p-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>

                                                    <span className="text-gray-700">
                                                        {updatingItem === item.id ? (
                                                            <span className="inline-block w-4 h-4 border-t-2 border-indigo-600 rounded-full animate-spin"></span>
                                                        ) : (
                                                            item.quantity
                                                        )}
                                                    </span>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.product.stock)}
                                                        disabled={item.quantity >= item.product.stock || updatingItem === item.id}
                                                        className="p-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={updatingItem === item.id}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Cart Summary */}
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <div className="flex justify-between">
                            <dt className="text-lg font-medium text-gray-900">Subtotal</dt>
                            <dd className="text-lg font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>

                        <div className="mt-8 flex space-x-4">
                            <button
                                type="button"
                                onClick={handleClearCart}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Clear Cart
                            </button>

                            <Link
                                to="/products"
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Continue Shopping
                            </Link>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart; 