import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
                Manage your products, orders, and customers.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Products</h2>
                    <p className="mt-2 text-gray-600">
                        Manage your product catalog, add new products, and update inventory.
                    </p>
                    <Link
                        to="/admin/products"
                        className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                        Manage Products
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
                    <p className="mt-2 text-gray-600">
                        View and manage customer orders, update order status, and handle returns.
                    </p>
                    <Link
                        to="/admin/orders"
                        className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                        Manage Orders
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
                    <p className="mt-2 text-gray-600">
                        View customer accounts, order history, and manage customer data.
                    </p>
                    <Link
                        to="/admin/customers"
                        className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                        Manage Customers
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 