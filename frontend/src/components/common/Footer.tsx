import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-md mx-auto px-6 text-center">
        <p className="text-xs text-gray-400 mb-2">
          © 2026 Smart Restaurant. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500 font-medium">
          <a href="#" className="hover:text-orange-600">Privacy Policy</a>
          <a href="#" className="hover:text-orange-600">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
