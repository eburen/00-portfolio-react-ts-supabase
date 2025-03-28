import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems } from '@/api/cart';
import { createOrder } from '@/api/orders';
import { useAuthStore } from '@/store/authStore';
import supabase from '@/lib/supabase';

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

const Checkout: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        paymentMethod: 'mock', // Default to mock for portfolio purposes
        couponCode: '',
        notes: ''
    });

    // State for cart and loading
    const [cartItems, setCartItems] = useState<CartItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);

    const shippingFee = 5.99;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shippingFee + tax;

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fetch cart items on mount
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) {
                navigate('/login?redirect=/checkout');
                return;
            }

            try {
                setLoading(true);
                const data = await getCartItems(user.id);

                if (data.length === 0) {
                    // Redirect to cart if empty
                    navigate('/cart');
                    return;
                }

                setCartItems(data as CartItemType[]);

                // Prefill user data if available
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, address')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.full_name || '',
                        address: profile.address || ''
                    }));
                }

            } catch (err) {
                console.error('Error fetching cart items:', err);
                setError('Failed to load your cart items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [user, navigate]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            navigate('/login?redirect=/checkout');
            return;
        }

        // Validate required fields
        const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'country', 'paymentMethod'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Format full address
            const shippingAddress = `${formData.fullName}\n${formData.address}\n${formData.city}, ${formData.state} ${formData.zipCode}\n${formData.country}`;

            // Create order
            const order = await createOrder({
                userId: user.id,
                shipping_address: shippingAddress,
                payment_method: formData.paymentMethod,
                coupon_code: formData.couponCode || undefined,
                notes: formData.notes || undefined
            });

            // Navigate to success page
            navigate(`/order-success/${order.id}`);

        } catch (err) {
            console.error('Error creating order:', err);
            setError('Failed to create your order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shipping Information */}
                        <div className="bg-white p-6 rounded-md shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name*
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address*
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City*
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                        State/Province*
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Zip/Postal Code*
                                    </label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country*
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white p-6 rounded-md shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method*
                                </label>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="paymentMock"
                                            name="paymentMethod"
                                            type="radio"
                                            value="mock"
                                            checked={formData.paymentMethod === 'mock'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="paymentMock" className="ml-2 text-gray-700">
                                            Mock Payment (for portfolio demonstration)
                                        </label>
                                    </div>

                                    <div className="flex items-center opacity-50 cursor-not-allowed">
                                        <input
                                            id="paymentCreditCard"
                                            name="paymentMethod"
                                            type="radio"
                                            value="credit_card"
                                            disabled
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="paymentCreditCard" className="ml-2 text-gray-700">
                                            Credit Card (disabled in demo)
                                        </label>
                                    </div>

                                    <div className="flex items-center opacity-50 cursor-not-allowed">
                                        <input
                                            id="paymentPaypal"
                                            name="paymentMethod"
                                            type="radio"
                                            value="paypal"
                                            disabled
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="paymentPaypal" className="ml-2 text-gray-700">
                                            PayPal (disabled in demo)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white p-6 rounded-md shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Coupon Code (if any)
                                    </label>
                                    <input
                                        type="text"
                                        id="couponCode"
                                        name="couponCode"
                                        value={formData.couponCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                        Order Notes (optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-white p-6 rounded-md shadow-sm border sticky top-4">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium mb-2">Items ({cartItems.length})</h3>

                                <ul className="space-y-3">
                                    {cartItems.map(item => (
                                        <li key={item.id} className="flex justify-between">
                                            <div>
                                                <span className="font-medium">{item.product.name}</span>
                                                <span className="block text-sm text-gray-500">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>${shippingFee.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={submitting || !user}
                                className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Processing...' : 'Place Order'}
                            </button>

                            <p className="text-sm text-gray-500 text-center">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 