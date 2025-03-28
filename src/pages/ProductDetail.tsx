import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductDetails } from '@/api/products';
import { addToCart } from '@/api/cart';
import { useAuthStore } from '@/store/authStore';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
    const [addingToCart, setAddingToCart] = useState(false);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [addToCartError, setAddToCartError] = useState<string | null>(null);

    // Group variations by type (e.g., "Size", "Color")
    const variationsByType: Record<string, Array<{ id: string; value: string; price_adjustment: number }>> = {};

    if (product?.variations) {
        product.variations.forEach((variation: any) => {
            if (!variationsByType[variation.name]) {
                variationsByType[variation.name] = [];
            }
            variationsByType[variation.name].push({
                id: variation.id,
                value: variation.value,
                price_adjustment: variation.price_adjustment
            });
        });
    }

    // Calculate final price including variations
    const basePrice = product?.price || 0;
    const totalPriceAdjustment = Object.values(selectedVariations).reduce((total, variationId) => {
        const variation = product?.variations.find((v: any) => v.id === variationId);
        return total + (variation?.price_adjustment || 0);
    }, 0);

    const finalPrice = basePrice + totalPriceAdjustment;

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await getProductDetails(id);
                setProduct(data);

                // Set initial selected image to primary image
                const primaryImage = data.images.find((img: any) => img.is_primary)?.url ||
                    data.images[0]?.url ||
                    null;
                setSelectedImage(primaryImage);

                // Initialize selected variations
                const initialVariations: Record<string, string> = {};
                Object.keys(variationsByType).forEach(type => {
                    if (variationsByType[type].length > 0) {
                        initialVariations[type] = variationsByType[type][0].id;
                    }
                });
                setSelectedVariations(initialVariations);

            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Failed to load product details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    // Handle variation selection
    const handleVariationChange = (type: string, variationId: string) => {
        setSelectedVariations(prev => ({
            ...prev,
            [type]: variationId
        }));
    };

    // Handle quantity change
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (product?.stock || 1)) {
            setQuantity(value);
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = `/login?redirect=/products/${id}`;
            return;
        }

        try {
            setAddingToCart(true);
            setAddToCartError(null);

            await addToCart({
                userId: user.id,
                productId: id!,
                quantity,
                variations: selectedVariations
            });

            setAddToCartSuccess(true);
            setTimeout(() => setAddToCartSuccess(false), 3000);
        } catch (err) {
            console.error('Error adding to cart:', err);
            setAddToCartError('Failed to add product to cart. Please try again.');
        } finally {
            setAddingToCart(false);
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

    // Render error state
    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    {error || 'Product not found'}
                </div>
                <div className="mt-4">
                    <Link to="/products" className="text-indigo-600 hover:text-indigo-800">
                        ← Back to products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm text-gray-500">
                <Link to="/" className="hover:text-indigo-600">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-indigo-600">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400">No image available</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {product.images && product.images.length > 0 && (
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((image: any) => (
                                <button
                                    key={image.id}
                                    onClick={() => setSelectedImage(image.url)}
                                    className={`aspect-square rounded border overflow-hidden ${selectedImage === image.url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200'
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={`${product.name} thumbnail`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                    <div className="mt-2 flex items-center space-x-2">
                        <div className="flex items-center text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={i < Math.round(product.avgRating || 0) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={i < Math.round(product.avgRating || 0) ? 0 : 1.5}
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                    />
                                </svg>
                            ))}
                        </div>
                        <span className="text-gray-500">
                            {product.avgRating ? `${product.avgRating.toFixed(1)} (${product.reviews.length} reviews)` : 'No reviews yet'}
                        </span>
                    </div>

                    <div className="mt-4">
                        <p className="text-2xl font-bold text-indigo-600">
                            ${finalPrice.toFixed(2)}
                        </p>
                        {product.stock > 0 ? (
                            <span className="mt-1 inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                                In Stock ({product.stock} available)
                            </span>
                        ) : (
                            <span className="mt-1 inline-block px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <p className="text-gray-600">{product.description}</p>
                    </div>

                    {/* Product Variations */}
                    {Object.keys(variationsByType).length > 0 && (
                        <div className="mt-6 space-y-4">
                            {Object.entries(variationsByType).map(([type, variations]) => (
                                <div key={type}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {variations.map(variation => (
                                            <button
                                                key={variation.id}
                                                onClick={() => handleVariationChange(type, variation.id)}
                                                className={`px-4 py-2 border rounded-md text-sm ${selectedVariations[type] === variation.id
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {variation.value}
                                                {variation.price_adjustment > 0 && ` (+$${variation.price_adjustment.toFixed(2)})`}
                                                {variation.price_adjustment < 0 && ` (-$${Math.abs(variation.price_adjustment).toFixed(2)})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add to Cart */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-24">
                                <label htmlFor="quantity" className="sr-only">Quantity</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                                className={`flex-1 py-3 px-6 rounded-md text-white font-medium ${product.stock === 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>

                        {addToCartSuccess && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-md">
                                Product added to cart successfully!
                            </div>
                        )}

                        {addToCartError && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-md">
                                {addToCartError}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Reviews */}
            <div className="mt-16 border-t border-gray-200 pt-10">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

                {product.reviews.length === 0 ? (
                    <p className="mt-4 text-gray-500">No reviews yet.</p>
                ) : (
                    <div className="mt-6 space-y-8">
                        {product.reviews.map((review: any) => (
                            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                    <div className="flex text-yellow-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg
                                                key={i}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={i < review.rating ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={i < review.rating ? 0 : 1.5}
                                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {review.profiles?.full_name || 'Anonymous'}
                                    </h3>
                                    <time className="text-sm text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </time>
                                </div>
                                {review.comment && (
                                    <p className="mt-3 text-gray-600">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {user ? (
                    <div className="mt-8">
                        <Link
                            to={`/products/${id}/review`}
                            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                        >
                            Write a Review
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8">
                        <Link
                            to={`/login?redirect=/products/${id}/review`}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            Log in to write a review
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail; 