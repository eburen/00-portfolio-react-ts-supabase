import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, isAdmin, signOut } = useAuthStore();

    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600">
                        E-Shop
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden space-x-8 md:flex">
                        <Link to="/" className="text-gray-700 hover:text-primary-600">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-primary-600">
                            Products
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="hidden items-center space-x-4 md:flex">
                        <Link to="/cart" className="text-gray-700 hover:text-primary-600">
                            <ShoppingCartIcon className="h-6 w-6" />
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/favorites" className="text-gray-700 hover:text-primary-600">
                                    <HeartIcon className="h-6 w-6" />
                                </Link>
                                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                                    <UserIcon className="h-6 w-6" />
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="space-y-1 pt-2 pb-3 md:hidden">
                        <Link
                            to="/"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Products
                        </Link>
                        <Link
                            to="/cart"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Cart
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/favorites"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Favorites
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header; 