import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings, 
  CreditCard, 
  FileText, 
  LogOut,
  UtensilsCrossed
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Store size={20} />, label: 'Restaurants', path: '/admin/restaurants' },
    { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
    { icon: <Settings size={20} />, label: 'Global Settings', path: '/admin/settings' },
    { icon: <CreditCard size={20} />, label: 'Billing & Subs', path: '/admin/billing' },
    { icon: <FileText size={20} />, label: 'System Logs', path: '/admin/logs' },
  ];

  return (
    <aside className="w-64 bg-[#1e1e1e] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
           <UtensilsCrossed size={20} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Smart Restaurant</h1>
          <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Super Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-bold">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@smartrest.com'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
