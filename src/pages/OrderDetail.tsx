import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="mt-2 text-gray-600">
                Order ID: {id}
            </p>

            <div className="mt-8">
                <p>Order details coming soon...</p>
            </div>
        </div>
    );
};

export default OrderDetail; 