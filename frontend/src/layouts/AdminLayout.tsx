import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Search, Bell } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header - Sticky */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-border-light px-8 py-4">
          <div>
            <h2 className="text-2xl font-bold text-text-main">Overview</h2>
            <p className="text-sm text-text-secondary">Welcome back, here is what is happening with your platform today.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search restaurants, emails, or IDs..." 
                className="pl-10 pr-4 h-10 w-80 rounded-lg border border-border-light bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>

            {/* Notifications */}
            <button className="relative w-10 h-10 rounded-lg border border-border-light flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;