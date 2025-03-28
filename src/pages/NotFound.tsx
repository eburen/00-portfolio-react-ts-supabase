import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
            <p className="mt-2 text-gray-600">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="mt-8 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound; 