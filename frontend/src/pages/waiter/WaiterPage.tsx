import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { waiterApi } from '../../api/waiterApi';

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

type TabType = 'NEW' | 'READY';

export default function WaiterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('NEW');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm gọi API lấy danh sách đơn hàng tùy theo Tab
  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (activeTab === 'NEW') {
        const res = await axiosClient.get('/admin/orders?status=RECEIVED');
        setOrders(res.data);
      } else {
        const res = await waiterApi.getReadyOrders();
        setOrders(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn (Duyệt/Hủy)
  const handleUpdateStatus = async (orderId: string, status: 'PREPARING' | 'CANCELLED') => {
    if (!window.confirm(`Bạn có chắc muốn ${status === 'PREPARING' ? 'duyệt' : 'hủy'} đơn này?`)) return;

    try {
      await waiterApi.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái đơn hàng");
    }
  };

  // Phục vụ món ăn
  const handleServeOrder = async (orderId: string) => {
    try {
      await waiterApi.serveOrder(orderId);
      alert("Đã đánh dấu phục vụ xong! ✅");
      fetchOrders();
    } catch (error) {
      alert("Lỗi cập nhật phục vụ");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Waiter Dashboard 🛎️</h1>
          <p className="text-gray-500 text-sm">Quản lý phục vụ bàn của bạn</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm"
        >
          {loading ? 'Đang tải...' : 'Làm mới 🔄'}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-6 max-w-sm">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'NEW' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          Mới ({activeTab === 'NEW' ? orders.length : '?'})
        </button>
        <button
          onClick={() => setActiveTab('READY')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'READY' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
        >
          Sẵn sàng ({activeTab === 'READY' ? orders.length : '?'})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Hiện không có yêu cầu nào.</p>
          </div>
        )}

        {orders.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${activeTab === 'READY' ? 'border-orange-200' : 'border-gray-100'
              }`}
          >
            <div className={`p-4 border-b flex justify-between items-center ${activeTab === 'READY' ? 'bg-orange-50' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-gray-800 shadow-sm border border-gray-100">
                  {order.tableSession.table.name.replace('Bàn ', '')}
                </span>
                <span className="font-bold text-gray-800">{order.tableSession.table.name}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 italic">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-4 space-y-3 min-h-[120px]">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{item.menuItem.name}</p>
                    {item.modifiers.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.modifiers.map(m => m.modifierOption.name).join(', ')}
                      </p>
                    )}
                    {item.note && (
                      <div className="mt-1 flex items-start gap-1">
                        <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded italic font-medium">"{item.note}"</span>
                      </div>
                    )}
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-black h-fit">x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50/50 flex gap-3 border-t">
              {activeTab === 'NEW' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                    className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleServeOrder(order.id)}
                  className="w-full bg-orange-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  🛎️ Đã phục vụ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
