import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { waiterApi } from '../../api/waiterApi';
import { useSocketStore } from '../../store/useSocketStore';
import { toast } from 'react-hot-toast';
import BillModal from '../../components/waiter/BillModal';

// Order Data Type
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: { name: string };
  modifiers: { modifierOption: { name: string; priceDelta?: number } }[];
  note?: string;
  status: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  billRequested?: boolean;
  tableSession: {
    table: { name: string };
    waiter?: {
      id: string;
      fullName: string;
      email: string;
    } | null;
  };
  items: OrderItem[];
}

type TabType = 'NEW' | 'READY' | 'BILLING';

export default function WaiterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('NEW');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  // Track selected items to ACCEPT (default true). Map<itemId, boolean>
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  // Bill Modal
  const [billOrder, setBillOrder] = useState<Order | null>(null);

  const socket = useSocketStore(state => state.socket);

  // Initialize selection when orders load
  useEffect(() => {
    if (activeTab === 'NEW' && orders.length > 0) {
      const newSelection = { ...selectedItems };
      let changed = false;
      orders.forEach(order => {
        order.items.forEach(item => {
          if (newSelection[item.id] === undefined && item.status === 'RECEIVED') {
            newSelection[item.id] = true; // Default Accept
            changed = true;
          }
        });
      });
      if (changed) setSelectedItems(newSelection);
    }
  }, [orders, activeTab]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Fetch orders based on active tab
  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (activeTab === 'NEW') {
        const res: any = await axiosClient.get('/orders?status=RECEIVED');
        setOrders(res.data || res);
      } else if (activeTab === 'READY') {
        const res: any = await waiterApi.getReadyOrders();
        setOrders(res.data || res);
      } else if (activeTab === 'BILLING') {
        // Get orders that are served or have bill requested
        const res: any = await axiosClient.get('/orders?status=SERVED');
        setOrders(res.data || res);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update order items (Accept/Reject individual items)
  const handleConfirmOrder = async (order: Order) => {
    const updatePayload = order.items
      .filter(item => item.status === 'RECEIVED') // Only update RECEIVED items
      .map(item => ({
        itemId: item.id,
        status: selectedItems[item.id] !== false ? 'PREPARING' : 'CANCELLED'
      }));

    if (updatePayload.length === 0) {
      toast.error("No items to confirm");
      return;
    }

    try {
      await waiterApi.updateOrderItems(order.id, updatePayload);
      toast.success(`Confirmed ${updatePayload.filter(i => i.status === 'PREPARING').length} items!`, { icon: '✅' });
      setOrders(prev => prev.filter(o => o.id !== order.id));
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  // Reject entire order
  const handleRejectOrder = async (orderId: string) => {
    try {
      await waiterApi.updateOrderStatus(orderId, 'CANCELLED');
      toast.success("Order cancelled", { icon: '❌' });
      fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  // Mark order as served
  const handleServeOrder = async (orderId: string) => {
    try {
      await waiterApi.serveOrder(orderId);
      toast.success("Marked as served! ✅");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // Open Bill Modal
  const handleViewBill = (order: Order) => {
    setBillOrder(order);
  };

  // Confirm Payment - Simple flow: Complete order and close session
  const handleConfirmPayment = async (orderId: string, paymentData: {
    paymentMethod: 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED' | null;
    finalAmount: number;
  }) => {
    try {
      // Simple flow: Just mark order as completed and close session
      await axiosClient.post(`/orders/${orderId}/complete`);
      toast.success(`Payment confirmed (${paymentData.paymentMethod})! Table is now ready for new guests. 🎉`);
      setBillOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to process payment");
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      // New order notification
      socket.on('new_order', (newOrder: Order) => {
        if (activeTab === 'NEW') {
          setOrders(prev => [newOrder, ...prev]);
        }
        toast.success(`New order from ${newOrder.tableSession.table.name}!`, { icon: '🔔' });
      });

      // Order status update notification
      socket.on('order_status_updated', (updatedOrder: Order) => {
        if (updatedOrder.status === 'READY') {
          toast.success(`Order for ${updatedOrder.tableSession.table.name} is ready!`, { icon: '🛎️', duration: 5000 });
          if (activeTab === 'READY') {
            setOrders(prev => [updatedOrder, ...prev]);
          }
        }
      });

      // Bill requested notification - real-time update
      socket.on('bill_requested', (updatedOrder: Order) => {
        toast.success(`${updatedOrder.tableSession?.table?.name || 'A table'} requested the bill!`, { icon: '💵', duration: 5000 });
        // Refresh if on BILLING tab or update orders list
        if (activeTab === 'BILLING') {
          fetchOrders();
        } else {
          // Update the order in any tab if it exists
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, billRequested: true } : o));
        }
      });
    }

    const interval = setInterval(fetchOrders, 30000);
    return () => {
      clearInterval(interval);
      socket?.off('new_order');
      socket?.off('order_status_updated');
      socket?.off('bill_requested');
    };
  }, [activeTab, socket]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Waiter Dashboard 🛎️</h1>
          <p className="text-gray-500 text-sm">Manage your table service</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm"
        >
          {loading ? 'Loading...' : 'Refresh 🔄'}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-6 max-w-lg">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'NEW' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          New ({activeTab === 'NEW' ? orders.length : '?'})
        </button>
        <button
          onClick={() => setActiveTab('READY')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'READY' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
        >
          Ready ({activeTab === 'READY' ? orders.length : '?'})
        </button>
        <button
          onClick={() => setActiveTab('BILLING')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BILLING' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
        >
          Billing ({activeTab === 'BILLING' ? orders.length : '?'})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No orders at the moment.</p>
          </div>
        )}

        {orders.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${activeTab === 'READY' ? 'border-orange-200' :
              activeTab === 'BILLING' ? 'border-green-200' : 'border-gray-100'
              }`}
          >
            <div className={`p-4 border-b flex justify-between items-center ${activeTab === 'READY' ? 'bg-orange-50' :
              activeTab === 'BILLING' ? 'bg-green-50' : 'bg-gray-50/50'
              }`}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-gray-800 shadow-sm border border-gray-100">
                  {order.tableSession.table.name.replace('Bàn ', '').replace('Table ', '')}
                </span>
                <div>
                  <span className="font-bold text-gray-800">{order.tableSession.table.name}</span>
                  {order.tableSession.waiter && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      👤 {order.tableSession.waiter.fullName}
                    </div>
                  )}
                  {order.billRequested && (
                    <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">
                      BILL REQUESTED
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 italic">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-4 space-y-3 min-h-[120px]">
              {order.items.filter(i => {
                // In NEW tab, only show RECEIVED items (not READY, PREPARING, etc.)
                if (activeTab === 'NEW') return i.status === 'RECEIVED';
                // In other tabs, show all non-cancelled items
                return i.status !== 'CANCELLED';
              }).map(item => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  {activeTab === 'NEW' && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        checked={selectedItems[item.id] !== false}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-bold text-gray-800 text-sm leading-tight ${activeTab === 'NEW' && selectedItems[item.id] === false ? 'line-through text-gray-400' : ''}`}>
                      {item.menuItem.name}
                    </p>
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
                  <div className="text-right">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-black">x{item.quantity}</span>
                    {activeTab === 'BILLING' && (
                      <p className="text-xs text-gray-500 mt-1">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total for Billing Tab */}
            {activeTab === 'BILLING' && (
              <div className="px-4 py-2 bg-gray-50 border-t border-dashed flex justify-between items-center">
                <span className="font-bold text-gray-600">Total</span>
                <span className="text-lg font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            <div className="p-4 bg-gray-50/50 flex gap-3 border-t">
              {activeTab === 'NEW' && (
                <>
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={() => handleConfirmOrder(order)}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95"
                  >
                    Confirm ({order.items.filter(i => i.status === 'RECEIVED' && selectedItems[i.id] !== false).length})
                  </button>
                </>
              )}

              {activeTab === 'READY' && (
                <button
                  onClick={() => handleServeOrder(order.id)}
                  className="w-full bg-orange-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  🛎️ Mark as Served
                </button>
              )}

              {activeTab === 'BILLING' && (
                <button
                  onClick={() => handleViewBill(order)}
                  className="w-full bg-green-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  📄 View & Print Bill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bill Modal */}
      {billOrder && (
        <BillModal
          order={billOrder}
          onClose={() => setBillOrder(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
}
