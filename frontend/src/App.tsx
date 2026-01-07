import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Guest Pages (Phase 3)
import EntryPoint from './pages/EntryPoint';
import MenuPage from './pages/MenuPage';

// Admin Pages (Phase 2)
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminTablePage from './pages/admin/AdminTablePage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';

import WaiterPage from './pages/waiter/WaiterPage';
import TableMapPage from './pages/waiter/TableMapPage';
import KitchenPage from './pages/kitchen/KitchenPage';

import { useSocketStore } from './store/useSocketStore';

// Placeholder cho các trang chưa tạo (để tránh lỗi import)
const OrderManagement = () => <div className="p-6 text-2xl font-bold">Quản lý Đơn hàng (Phase 4)</div>;

function App() {
  const connect = useSocketStore(state => state.connect);

  React.useEffect(() => {
    connect();
  }, [connect]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* ========================= GUEST ROUTES (Phase 3) ========================= */}
        {/* Route mặc định để quét mã QR: /?tableId=xxx */}
        <Route path="/" element={<EntryPoint />} />
        <Route path="/menu" element={<MenuPage />} />

        {/* ========================= ADMIN ROUTES (Phase 2) ========================= */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Tự động chuyển hướng /admin về /admin/menu */}
          <Route index element={<Navigate to="/admin/menu" replace />} />

          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="tables" element={<AdminTablePage />} />

          {/* Route dự phòng cho Phase 4 */}
          <Route path="orders" element={<OrderManagement />} />

        </Route>

        <Route path="/waiter" element={<WaiterPage />} />
        <Route path="/waiter/map" element={<TableMapPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />

        {/* ========================= 404 NOT FOUND ========================= */}
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