import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocketStore } from './store/useSocketStore';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import GuestLayout from './layouts/GuestLayout';

// Guest Pages
import EntryPoint from './pages/EntryPoint';
import MenuPage from './pages/MenuPage';
import OrderTrackingPage from './pages/guest/OrderTrackingPage';

//Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OAuthSuccessPage from './pages/auth/OAuthSuccessPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';


// Admin Pages
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminTablePage from './pages/admin/AdminTablePage';
import CategoryPage from './pages/admin/AdminCategoryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';

// Staff Pages (Waiter & Kitchen)
import WaiterPage from './pages/waiter/WaiterPage';
import TableMapPage from './pages/waiter/TableMapPage';
import KitchenPage from './pages/kitchen/KitchenPage';

function App() {
  const connect = useSocketStore(state => state.connect);

  React.useEffect(() => {
    connect();
  }, [connect]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        
        {/* Guest Flow */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<EntryPoint />} />
          <Route path="/tracking" element={<OrderTrackingPage />} />
        </Route>
        <Route path="/menu" element={<MenuPage />} />

        {/* Auth Flow */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Administration Flow */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="tables" element={<AdminTablePage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="employees" element={<AdminEmployeesPage />} />
        </Route>

        {/* Service & Operational Flow */}
        <Route path="/waiter" element={<WaiterPage />} />
        <Route path="/waiter/map" element={<TableMapPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold text-gray-800">404</h1>
            <p className="text-gray-500">Trang bạn tìm kiếm không tồn tại.</p>
          </div>
        } />
      </Routes>
    </>
  );
}


export default App;
