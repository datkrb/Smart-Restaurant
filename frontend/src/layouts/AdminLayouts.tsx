import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/categories" className="block p-3 hover:bg-slate-700 rounded-lg">Danh mục</Link>
          <Link to="/admin/menu" className="block p-3 hover:bg-slate-700 rounded-lg">Món ăn</Link>
          <Link to="/admin/tables" className="block p-3 hover:bg-slate-700 rounded-lg">Quản lý bàn</Link>
          <Link to="/admin/orders" className="block p-3 hover:bg-slate-700 rounded-lg opacity-50">Đơn hàng (Phase 4)</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* Nơi hiển thị các trang con */}
      </main>
    </div>
  );
};

export default AdminLayout;