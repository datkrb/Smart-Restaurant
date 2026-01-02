import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useSessionStore } from '../store/useSessionStore';
import { guestApi } from '../api/guestApi';

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalAmount, clearCart } = useCartStore();
  const sessionId = useSessionStore(state => state.sessionId); // Lấy ID phiên làm việc
  const [isOrdering, setIsOrdering] = useState(false);

  if (!isOpen) return null;

  const handleOrder = async () => {
    if (!sessionId) {
      alert("Lỗi: Không tìm thấy phiên làm việc!");
      return;
    }

    if (items.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    try {
      setIsOrdering(true);
      
      // Gọi API đặt món
      await guestApi.placeOrder({
        tableSessionId: sessionId,
        items: items
      });

      alert("🎉 Đặt món thành công! Nhà bếp sẽ chuẩn bị ngay.");
      clearCart(); // Xóa giỏ hàng sau khi đặt thành công
      onClose();   // Đóng modal
      
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra khi đặt món. Vui lòng thử lại.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Giỏ hàng của bạn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Chưa có món nào được chọn.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-bold text-gray-800">{item.name} <span className="text-orange-600">x{item.quantity}</span></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(item.selectedModifiers || {}).flat().map(o => o.name).join(', ')}
                  </p>
                </div>
                <p className="font-bold text-gray-700">{(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Tổng cộng:</span>
              <span className="text-orange-600">{totalAmount().toLocaleString()}đ</span>
            </div>
            
            <button 
              onClick={handleOrder} 
              disabled={isOrdering}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                isOrdering ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
              }`}
            >
              {isOrdering ? 'Đang gửi đơn...' : 'Xác nhận đặt món'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}