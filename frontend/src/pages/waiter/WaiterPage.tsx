import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

// Định nghĩa kiểu dữ liệu cho Order 
interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  tableSession: {
    table: { name: string };
  };
  items: {
    id: string;
    quantity: number;
    menuItem: { name: string };
    modifiers: { modifierOption: { name: string } }[];
    note?: string;
  }[];
}

export default function WaiterPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Hàm gọi API lấy các đơn hàng trạng thái RECEIVED
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/admin/orders?status=RECEIVED');
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Waiter Dashboard 🛎️</h1>
        <button onClick={fetchOrders} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Làm mới
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && <p className="text-gray-500 col-span-3 text-center">Hiện không có đơn hàng mới nào.</p>}
        
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-yellow-400">
            <div className="p-4 bg-yellow-50 border-b flex justify-between items-center">
              <span className="font-bold text-lg">{order.tableSession.table.name}</span>
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            
            <div className="p-4 space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between font-medium">
                    <span>{item.menuItem.name}</span>
                    <span className="text-orange-600">x{item.quantity}</span>
                  </div>
                  {/* Hiển thị Modifier (Size, Topping) */}
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-gray-500">
                      + {item.modifiers.map(m => m.modifierOption.name).join(', ')}
                    </p>
                  )}
                  {/* Hiển thị Note */}
                  {item.note && <p className="text-xs text-red-500 italic">"Ghi chú: {item.note}"</p>}
                </div>
              ))}
            </div>
            
            {/* Phần Action Buttons sẽ làm ở bước sau */}
          </div>
        ))}
      </div>
    </div>
  );
}