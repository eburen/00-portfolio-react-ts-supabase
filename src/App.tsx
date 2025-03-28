import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy-loaded route components
const Home = lazy(() => import('@/pages/Home'));
const ProductList = lazy(() => import('@/pages/ProductList'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Profile = lazy(() => import('@/pages/Profile'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin routes
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));

// Route guards
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { isAdmin, isLoading } = useAuthStore();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return isAdmin ? children : <Navigate to="/" />;
};

function App() {
    const { initialize, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <Toaster position="top-right" />
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Public Routes */}
                        <Route index element={<Home />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/:id" element={<ProductDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />

                        {/* Protected Customer Routes */}
                        <Route path="checkout" element={
                            <PrivateRoute>
                                <Checkout />
                            </PrivateRoute>
                        } />
                        <Route path="order-success" element={
                            <PrivateRoute>
                                <OrderSuccess />
                            </PrivateRoute>
                        } />
                        <Route path="orders" element={
                            <PrivateRoute>
                                <Orders />
                            </PrivateRoute>
                        } />
                        <Route path="orders/:id" element={
                            <PrivateRoute>
                                <OrderDetail />
                            </PrivateRoute>
                        } />
                        <Route path="favorites" element={
                            <PrivateRoute>
                                <Favorites />
                            </PrivateRoute>
                        } />
                        <Route path="profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="admin">
                            <Route index element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } />
                            <Route path="products" element={
                                <AdminRoute>
                                    <AdminProducts />
                                </AdminRoute>
                            } />
                            <Route path="orders" element={
                                <AdminRoute>
                                    <AdminOrders />
                                </AdminRoute>
                            } />
                            <Route path="customers" element={
                                <AdminRoute>
                                    <AdminCustomers />
                                </AdminRoute>
                            } />
                        </Route>

                        {/* Not Found */}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
}

export default App; 