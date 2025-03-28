import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <svg
                    className="h-12 w-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Order Successful!</h1>
            <p className="mt-4 max-w-md text-gray-600">
                Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
            </p>
            <p className="mt-2 text-gray-600">
                Order #: 12345678 (demo only)
            </p>
            <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                    to="/orders"
                    className="rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                >
                    View Orders
                </Link>
                <Link
                    to="/products"
                    className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess; 