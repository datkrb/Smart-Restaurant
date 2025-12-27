import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface Order {
  id: string;
  status: string;
  createdAt: string;
  tableSession: { table: { name: string } };
  items: {
    id: string;
    quantity: number;
    menuItem: { name: string };
    modifiers: { modifierOption: { name: string } }[];
    note?: string;
  }[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Lấy danh sách các món ĐANG CHẾ BIẾN
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/admin/orders?status=PREPARING');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (orderId: string) => {
    try {
      await axiosClient.patch(`/admin/orders/${orderId}/status`, { status: 'READY' });
      fetchOrders();
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <header className="mb-6 flex justify-between items-center border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-orange-500">KDS - Nhà Bếp 🔥</h1>
        <button onClick={fetchOrders} className="bg-slate-700 px-4 py-2 rounded">Refresh</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orders.length === 0 && <p className="text-slate-500 col-span-3 text-center text-xl">Hiện không có món cần nấu.</p>}

        {orders.map(order => (
          <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
            <div className="p-4 bg-slate-700 rounded-t-xl flex justify-between">
              <span className="font-bold text-xl text-yellow-400">{order.tableSession.table.name}</span>
              <span className="text-sm text-slate-300">{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>

            <div className="p-4 flex-1 space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="border-b border-slate-600 pb-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">{item.menuItem.name}</span>
                    <span className="bg-white text-black px-2 rounded font-bold">{item.quantity}</span>
                  </div>
                  {item.modifiers.length > 0 && (
                    <p className="text-sm text-slate-400 mt-1">
                      + {item.modifiers.map(m => m.modifierOption.name).join(', ')}
                    </p>
                  )}
                  {item.note && <p className="text-red-400 font-bold mt-1">⚠️ {item.note}</p>}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleComplete(order.id)}
              className="m-4 bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-bold text-xl uppercase tracking-wider"
            >
              Báo Xong (Ready)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}