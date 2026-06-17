import { Routes, Route } from 'react-router';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';

// Admin
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminGuard from '@/pages/admin/AdminGuard';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminHomepage from '@/pages/admin/AdminHomepage';

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Routes>
          {/* Public storefront */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* Admin login (no layout) */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected admin panel */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/homepage" element={<AdminHomepage />} />
            </Route>
          </Route>
        </Routes>
      </CartProvider>
    </LanguageProvider>
  );
}
