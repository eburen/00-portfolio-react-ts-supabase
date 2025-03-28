import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-gray-300">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-lg font-bold text-white">E-Shop</h3>
                        <p className="mt-2 text-sm">
                            Your one-stop destination for all your shopping needs. Quality products,
                            competitive prices, and excellent customer service.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white">Quick Links</h3>
                        <ul className="mt-2 space-y-2">
                            <li>
                                <Link to="/" className="text-sm hover:text-white">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-sm hover:text-white">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-sm hover:text-white">
                                    Cart
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold text-white">Customer Service</h3>
                        <ul className="mt-2 space-y-2">
                            <li>
                                <Link to="#" className="text-sm hover:text-white">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-sm hover:text-white">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-sm hover:text-white">
                                    Shipping & Returns
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold text-white">Newsletter</h3>
                        <p className="mt-2 text-sm">
                            Subscribe to our newsletter for the latest updates and offers.
                        </p>
                        <form className="mt-4 flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full rounded-l-md border-0 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                type="submit"
                                className="rounded-r-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm">
                    <p>&copy; {currentYear} E-Shop. All rights reserved.</p>
                    <p className="mt-2">
                        This is a portfolio project and not a real e-commerce site.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 