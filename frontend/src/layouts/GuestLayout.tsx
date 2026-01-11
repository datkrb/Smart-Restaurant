import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-md w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default GuestLayout;
