import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-black text-gray-800 tracking-tight">
          Smart<span className="text-orange-600">Food</span>
        </Link>
        
        <div className="flex items-center gap-3">
            <Link to="/tracking" className="p-2 text-gray-500 hover:text-orange-600 transition-colors relative">
                <ShoppingBag size={22} />
            </Link>
             <Link to="/admin" className="p-2 text-gray-500 hover:text-orange-600 transition-colors">
                <User size={22} />
            </Link>
        </div>
      </div>
    </header>
  );
};
