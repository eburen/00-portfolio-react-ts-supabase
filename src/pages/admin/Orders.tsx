import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type Order = {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'unpaid' | 'paid' | 'refunded';
    total_price: number;
    created_at: string;
    shipping_address: string;
    profile?: { full_name: string; phone: string };
    order_items: any[];
};

const AdminOrders: React.FC = () => {
    const { isAdmin } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch orders on mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);

                let query = supabase
                    .from('orders')
                    .select(`
                        *,
                        profile:profiles(full_name, phone),
                        order_items(
                            id,
                            product_id,
                            product_name,
                            quantity,
                            price,
                            variations
                        )
                    `)
                    .order('created_at', { ascending: false });

                // Apply filter if not showing all
                if (statusFilter !== 'all') {
                    query = query.eq('status', statusFilter);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) throw fetchError;
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [statusFilter]);

    // Handle order status update
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .select(`
                    *,
                    profile:profiles(full_name, phone),
                    order_items(
                        id,
                        product_id,
                        product_name,
                        quantity,
                        price,
                        variations
                    )
                `)
                .single();

            if (error) throw error;

            // Update orders list and selected order if open
            setOrders(prev =>
                prev.map(order => order.id === orderId ? data : order)
            );

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(data);
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status. Please try again.');
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Format price
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    // Format address for display
    const formatAddress = (address: string) => {
        return address.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    // Format order item variations
    const formatVariations = (variations: any) => {
        if (!variations) return null;

        return Object.entries(variations).map(([key, value]) => (
            <span key={key} className="block text-sm">
                <b>{key}:</b> {String(value)}
            </span>
        ));
    };

    // Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate order metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.payment_status === 'paid' ? order.total_price : 0);
    }, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    // Status options for filter and updates
    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Available status transitions
    const getAvailableStatusTransitions = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pending':
                return ['processing', 'cancelled'];
            case 'processing':
                return ['shipped', 'cancelled'];
            case 'shipped':
                return ['delivered', 'cancelled'];
            case 'delivered':
                return ['cancelled'];
            case 'cancelled':
                return ['pending'];
            default:
                return [];
        }
    };

    // Check if user is authorized
    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    You don't have permission to access this page.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Order Statistics */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-gray-500 text-sm">Total Orders</div>
                    <div className="text-3xl font-bold">{totalOrders}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-gray-500 text-sm">Total Revenue</div>
                    <div className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-gray-500 text-sm">Pending Orders</div>
                    <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="mt-6 flex items-center">
                <span className="mr-2 text-gray-700">Filter:</span>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="mt-12 flex justify-center">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">#{order.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.profile?.full_name || 'Unknown Customer'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{formatPrice(order.total_price)}</div>
                                            <div className="text-xs text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.payment_status)}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Order #{selectedOrder.id.slice(0, 8)}
                                </h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        <b>Name:</b> {selectedOrder.profile?.full_name || 'Unknown Customer'}<br />
                                        <b>Phone:</b> {selectedOrder.profile?.phone || 'No phone provided'}<br />
                                        <b>Customer ID:</b> {selectedOrder.user_id}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {formatAddress(selectedOrder.shipping_address)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Order Status</h4>
                                    <p className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                                    <p className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.payment_status)}`}>
                                            {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Variations
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedOrder.order_items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {item.product_name}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {formatVariations(item.variations)}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-center text-gray-900">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-right text-gray-900">
                                                        {formatPrice(item.price)}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    Order Total:
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                    {formatPrice(selectedOrder.total_price)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Update Order Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {getAvailableStatusTransitions(selectedOrder.status).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md 
                                                ${status === 'cancelled' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders; 