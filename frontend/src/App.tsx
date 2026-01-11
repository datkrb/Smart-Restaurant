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

// Admin Pages
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminTablePage from './pages/admin/AdminTablePage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Staff Pages (Waiter & Kitchen)
import WaiterPage from './pages/waiter/WaiterPage';
import TableMapPage from './pages/waiter/TableMapPage';
import KitchenPage from './pages/kitchen/KitchenPage';

// Placeholder for missing pages
const OrderManagement = () => <div className="p-6 text-2xl font-bold">Quản lý Đơn hàng</div>;

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

        {/* Administration Flow */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="tables" element={<AdminTablePage />} />
          <Route path="orders" element={<OrderManagement />} />
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
