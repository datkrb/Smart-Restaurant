import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { Order } from '../../types/order.types';
import { Search, Filter, Calendar } from 'lucide-react';
import { ui } from '../../utils/swalHelper';

const ORDER_STATUSES = [
  { value: 'RECEIVED', label: 'Mới nhận', color: 'bg-blue-100 text-blue-700' },
  { value: 'PROCESSING', label: 'Đang chế biến', color: 'bg-orange-100 text-orange-700' },
  { value: 'READY', label: 'Đã xong', color: 'bg-purple-100 text-purple-700' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [todayOnly, setTodayOnly] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Setup socket listener here if needed for realtime
  }, [page, statusFilter, todayOnly]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sortOrder: 'desc',
        sortBy: 'createdAt'
      };

      if (statusFilter) params.status = statusFilter;
      
      if (todayOnly) {
          const start = new Date();
          start.setHours(0,0,0,0);
          const end = new Date();
          end.setHours(23,59,59,999);
          params.startDate = start.toISOString();
          params.endDate = end.toISOString();
      }

      const response = await orderApi.getOrders(params);
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
      try {
          await orderApi.updateStatus(orderId, newStatus);
          ui.alertSuccess("Cập nhật trạng thái thành công");
          fetchOrders();
      } catch (error) {
          ui.alertError("Lỗi cập nhật trạng thái");
      }
  };

  const getStatusColor = (status: string) => {
      return ORDER_STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
      return ORDER_STATUSES.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Theo dõi và xử lý các đơn hàng từ khách</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
             <button 
                onClick={() => setTodayOnly(!todayOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${todayOnly ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}
             >
                <Calendar size={16} />
                {todayOnly ? 'Hôm nay' : 'Tất cả ngày'}
             </button>

             <div className="relative">
                 <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white text-sm font-medium text-gray-700 h-full"
                 >
                     <option value="">Tất cả trạng thái</option>
                     {ORDER_STATUSES.map(s => (
                         <option key={s.value} value={s.value}>{s.label}</option>
                     ))}
                 </select>
             </div>
             
             <button onClick={fetchOrders} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                 Làm mới
             </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
             <div className="p-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
             </div>
        ) : orders.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                Không tìm thấy đơn hàng nào.
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Đơn / Bàn</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Món ăn</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">#{order.id.slice(-6)}</div>
                                    <div className="text-xs font-medium text-orange-600 bg-orange-50 inline-block px-1.5 py-0.5 rounded mt-1">
                                        {order.tableSession?.table?.name || 'Unknown Table'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-[250px] truncate">
                                        {order.items?.map(i => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {order.items?.length} items
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <select
                                        className="text-xs border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {ORDER_STATUSES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 text-sm font-medium"
                >
                    Trước
                </button>
                <span className="px-3 py-1 text-sm font-bold text-gray-700 self-center">
                    Trang {page} / {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50 text-sm font-medium"
                >
                    Sau
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
