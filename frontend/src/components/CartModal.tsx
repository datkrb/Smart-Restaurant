import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useSessionStore } from '../store/useSessionStore';
import { guestApi } from '../api/guestApi';

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalAmount, clearCart, updateQuantity, removeFromCart } = useCartStore();
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Chưa có món nào được chọn.</p>
        ) : (
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.cartItemId} className="flex flex-col border-b last:border-0 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-4">
                    <p className="font-bold text-gray-800 text-base">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 italic">
                      {Object.values(item.selectedModifiers || {}).flat().map(o => o.name).join(', ') || 'Không có tùy chọn'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-orange-600 font-bold hover:bg-orange-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{(item.totalPrice * item.quantity).toLocaleString()}đ</p>
                </div>
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
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isOrdering ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
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