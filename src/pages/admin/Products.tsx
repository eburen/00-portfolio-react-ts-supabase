import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    category_id: string;
    category?: { name: string };
    is_featured: boolean;
    created_at: string;
};

const AdminProducts: React.FC = () => {
    const { user, isAdmin } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Product form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        is_featured: false
    });

    // Fetch products on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (categoriesError) throw categoriesError;
                setCategories(categoriesData || []);

                // Fetch products with category
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select(`
                        *,
                        category:categories(name)
                    `)
                    .order('created_at', { ascending: false });

                if (productsError) throw productsError;
                setProducts(productsData || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: target.checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            is_featured: false
        });
        setEditingProduct(null);
    };

    // Open form for creating new product
    const handleAddNew = () => {
        resetForm();
        setIsFormOpen(true);
    };

    // Open form for editing existing product
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id || '',
            is_featured: product.is_featured
        });
        setIsFormOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: formData.category_id || null,
                is_featured: formData.is_featured
            };

            if (editingProduct) {
                // Update existing product
                const { data, error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)
                    .select(`*, category:categories(name)`)
                    .single();

                if (error) throw error;

                setProducts(prev =>
                    prev.map(product =>
                        product.id === data.id ? data : product
                    )
                );
            } else {
                // Create new product
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select(`*, category:categories(name)`)
                    .single();

                if (error) throw error;

                setProducts(prev => [data, ...prev]);
            }

            setIsFormOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error saving product:', err);
            setError('Failed to save product. Please try again.');
        }
    };

    // Handle product deletion
    const handleDelete = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            setProducts(prev => prev.filter(product => product.id !== productId));
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product. Please try again.');
        }
    };

    // Format price
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Add New Product
                </button>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Product Form */}
            {isFormOpen && (
                <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name*
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price*
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock*
                                </label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_featured"
                                name="is_featured"
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                                Featured Product
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFormOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
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
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No products found. Add your first product!
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.stock}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.is_featured ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Featured
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Standard
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProducts; 