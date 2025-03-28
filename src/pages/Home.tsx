import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Our E-commerce Store</h1>
            <p className="mt-4 text-gray-600">
                Browse our latest products and special offers. This is a showcase of a full-featured
                e-commerce application built with React, TypeScript, Tailwind CSS, and Supabase.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature boxes */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Wide Product Selection</h2>
                    <p className="mt-2 text-gray-600">
                        Browse through our extensive catalog of products across various categories.
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Secure Checkout</h2>
                    <p className="mt-2 text-gray-600">
                        Enjoy a seamless and secure checkout process with multiple payment options.
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Fast Delivery</h2>
                    <p className="mt-2 text-gray-600">
                        Get your products delivered quickly and efficiently to your doorstep.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home; 