import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Utensils,
  Table as TableIcon,
  ClipboardList,
  LogOut,
  ChefHat,
  ChevronRight,
  User,
  Layers,
  Users
} from 'lucide-react';

const SidebarItem = ({ item }: { item: { path: string; name: string; icon: React.ReactNode } }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) => `
      flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
      ${isActive
        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white'
        : 'hover:bg-white/5 hover:text-white'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3.5 z-10">
          <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'} transition-colors`}>
            {item.icon}
          </span>
          <span className="font-bold text-sm tracking-wide">{item.name}</span>
        </div>
        <ChevronRight 
          size={14} 
          className={`z-10 transition-all duration-300 ${
            isActive 
              ? 'translate-x-0 opacity-100' 
              : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
          }`} 
        />
      </>
    )}
  </NavLink>
);

const AdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/categories', name: 'Danh mục', icon: <Layers size={20} /> },
    { path: '/admin/menu', name: 'Món ăn', icon: <Utensils size={20} /> },
    { path: '/admin/tables', name: 'Quản lý bàn', icon: <TableIcon size={20} /> },
    { path: '/admin/orders', name: 'Đơn hàng', icon: <ClipboardList size={20} /> },
    { path: '/admin/users', name: 'Quản lý khách', icon: <User size={20} /> },
    { path: '/admin/employees', name: 'Quản lý nhân viên', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-72 bg-[#1E293B] text-slate-300 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-20"
      >
        {/* Brand Logo */}
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-2.5 rounded-2xl shadow-xl shadow-orange-600/20 text-white">
            <ChefHat size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-tight italic">SMART<span className="text-orange-500">FOOD</span></span>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Admin</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem key={item.path} item={item} />
          ))}
        </nav>

        {/* User Profile Hook */}
        <div className="p-4 border-t border-white/5 bg-slate-900/30 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 group hover:border-orange-500/30 transition-all duration-500">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-orange-500 border border-white/10 shadow-inner">
                <User size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E293B]"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">Administrator</p>
              <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">Manager Account</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all active:scale-95"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Framework */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Floating Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="text-gray-800">
              <h2 className="text-lg font-black tracking-tight leading-none uppercase">Dashboard Overview</h2>
              <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mt-1">REAL-TIME RESTAURANT ANALYTICS</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
              <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 hidden sm:flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-green-700 tracking-[0.1em]">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        /* Glass Effect */
        .sidebar-glass {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;