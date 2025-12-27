// src/components/CartModal.tsx
import React from 'react';
import { useCartStore } from '../store/useCartStore';

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalAmount } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Giỏ hàng của bạn</h2>
          <button onClick={onClose} className="text-gray-400">Đóng</button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-3 border-b">
            <div>
              <p className="font-bold">{item.name} x {item.quantity}</p>
              <p className="text-xs text-gray-500">
                {Object.values(item.selectedModifiers || {}).flat().map(o => o.name).join(', ')}
              </p>
            </div>
            <p className="font-bold text-orange-600">{(item.price * item.quantity).toLocaleString()}đ</p>
          </div>
        ))}
        <div className="mt-6 flex justify-between text-lg font-bold">
          <span>Tổng cộng:</span>
          <span className="text-orange-600">{totalAmount().toLocaleString()}đ</span>
        </div>
        <button className="w-full bg-orange-600 text-white py-4 rounded-xl mt-4 font-bold">
          Xác nhận đặt món
        </button>
      </div>
    </div>
  );
}