import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, ProductSummary } from '@/api/products';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'popular'>('newest');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const productsPerPage = 12;

    // Load products and categories on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch categories
                const categoriesData = await getCategories();
                setCategories(categoriesData);

                // Fetch products with filters
                const { data, count } = await getProducts({
                    limit: productsPerPage,
                    offset: (page - 1) * productsPerPage,
                    category_id: selectedCategory || undefined,
                    search: searchQuery || undefined,
                    sort_by: sortBy
                });

                setProducts(data || []);
                setTotalCount(count || 0);
                setError(null);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, searchQuery, selectedCategory, sortBy]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page when searching
    };

    // Handle category filter
    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
        setPage(1); // Reset to first page when filtering
    };

    // Handle pagination
    const totalPages = Math.ceil(totalCount / productsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>

            {/* Filters and Search */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-indigo-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </form>

                <div className="flex gap-2">
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => handleCategoryChange(e.target.value || null)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="popular">Popular</option>
                    </select>
                </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="flex justify-center items-center py-16">
                    <div className="spinner"></div>
                </div>
            )}

            {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Product Grid */}
            {!loading && !error && (
                <>
                    {products.length === 0 ? (
                        <div className="mt-8 p-8 text-center border rounded-md">
                            <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="group">
                                    <Link to={`/products/${product.id}`} className="block">
                                        <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
                                            {product.primary_image ? (
                                                <img
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <h3 className="text-gray-900 font-medium truncate">{product.name}</h3>

                                            <div className="mt-1 flex justify-between items-center">
                                                <p className="text-indigo-600 font-medium">${product.price.toFixed(2)}</p>

                                                {product.avg_rating && (
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-400 mr-1">★</span>
                                                        <span className="text-sm text-gray-600">
                                                            {product.avg_rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setPage(index + 1)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${page === index + 1
                                                ? 'bg-indigo-600 text-white'
                                                : 'border hover:bg-gray-50'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductList; 