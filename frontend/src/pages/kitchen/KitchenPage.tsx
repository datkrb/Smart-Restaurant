import React, { useEffect, useState, useRef, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Bell, Filter, RefreshCw } from 'lucide-react';
import { useSocketStore } from '../../store/useSocketStore';
import { toast } from 'react-hot-toast';

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

const OrderTimer = ({ startTime }: { startTime: string | Date }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const start = useMemo(() => {
    if (!startTime) return null;
    try {
      const d = new Date(startTime).getTime();
      return isNaN(d) ? null : d;
    } catch (e) {
      return null;
    }
  }, [startTime]);

  if (!start) return <span className="text-xs text-slate-500 font-mono">--:--</span>;

  // Tính số giây đã trôi qua
  const diffInSeconds = Math.floor((now - start) / 1000);

  // Nếu thời gian âm (do lệch đồng hồ máy khách/chủ), hiển thị 0 hoặc 1s để tránh đứng im 00:00 quá lâu
  const safeElapsed = diffInSeconds > 0 ? diffInSeconds : 1;

  // Chặn trường hợp thời gian quá lớn (lỗi data)
  const normalizedElapsed = safeElapsed > 86400 * 2 ? 0 : safeElapsed;

  const minutes = Math.floor(normalizedElapsed / 60);
  const seconds = normalizedElapsed % 60;

  const isLately = minutes >= 15;
  const isUrgent = minutes >= 25;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm tabular-nums ${isUrgent ? 'bg-red-500 text-white animate-pulse' :
      isLately ? 'bg-orange-500 text-white' :
        'bg-green-500/20 text-green-400 border border-green-500/30'
      }`}>
      <Clock size={14} />
      <span>{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
    </div>
  );
};

// Hàm tạo âm thanh "Ding" không cần file
const playNotificationSound = () => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const socket = useSocketStore(state => state.socket);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get('/orders?status=PREPARING');
      const newOrders = res.data || res;

      setOrders(newOrders);
      setLastOrderCount(newOrders.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      // Khi có thay đổi trạng thái đơn hàng (từ Waiter duyệt hoặc Bếp khác làm xong)
      socket.on('order_status_updated', (updatedOrder: Order) => {
        setOrders(prev => {
          // Nếu đơn hàng chuyển sang PREPARING -> Thêm vào danh sách bếp
          if (updatedOrder.status === 'PREPARING') {
            if (prev.find(o => o.id === updatedOrder.id)) return prev;
            playNotificationSound();
            toast.success(`Đơn mới - Bàn ${updatedOrder.tableSession.table.name}!`, { icon: '🔥' });
            return [...prev, updatedOrder];
          }

          // Nếu đơn hàng chuyển sang READY hoặc khác -> Xóa khỏi danh sách bếp
          if (updatedOrder.status !== 'PREPARING') {
            return prev.filter(o => o.id !== updatedOrder.id);
          }

          return prev;
        });
      });
    }

    const interval = setInterval(fetchOrders, 30000);
    return () => {
      clearInterval(interval);
      socket?.off('order_status_updated');
    };
  }, [socket]);

  const handleComplete = async (orderId: string) => {
    try {
      await axiosClient.patch(`/orders/${orderId}/status`, { status: 'READY' });
      // Xóa ngay khỏi UI để tạo cảm giác mượt mà
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setLastOrderCount(prev => prev - 1);
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div className="bg-[#0f1115] min-h-screen text-slate-100 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#16191e]/80 backdrop-blur-xl border-b border-white/5 p-4 md:px-8 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-600/20">
            <Bell className="text-white" size={24} fill="white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">
              Kitchen <span className="text-orange-500">Display</span> System
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Monitoring • {orders.length} Active Orders
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className={`p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} className="text-slate-400" />
          </button>
          <div className="hidden md:flex bg-white/5 border border-white/10 rounded-2xl p-1">
            <button className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20">All Items</button>
            <button className="px-4 py-2 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors">By Table</button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="group relative bg-[#1c2128] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:border-white/10 transition-all"
              >
                {/* Order Header */}
                <div className="p-5 bg-gradient-to-br from-white/5 to-transparent border-b border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-500 text-white font-black px-4 py-2 rounded-2xl text-xl shadow-lg shadow-orange-500/20">
                      {order.tableSession.table.name.replace('Bàn ', '')}
                    </div>
                    <OrderTimer startTime={order.createdAt} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Table {order.tableSession.table.name}</span>
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums">ID: #{order.id.slice(-4).toUpperCase()}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-5 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {order.items.map(item => (
                    <div key={item.id} className="relative pl-10">
                      {/* Quantity Indicator */}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-orange-500 shadow-inner">
                        {item.quantity}
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-lg leading-tight text-white group-hover:text-orange-400 transition-colors uppercase">
                          {item.menuItem.name}
                        </p>

                        {item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.modifiers.map((m, i) => (
                              <span key={i} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/5 font-bold uppercase transition-colors hover:border-slate-500">
                                {m.modifierOption.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.note && (
                          <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-2 flex gap-2 items-start">
                            <Bell size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] font-black text-red-400 italic leading-snug uppercase">
                              Note: "{item.note}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-[#16191e] border-t border-white/5 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleComplete(order.id)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-green-600/10 flex items-center justify-center gap-3 transition-colors"
                  >
                    <CheckCircle size={20} fill="#fff" className="text-green-600" />
                    Mark as Ready
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Bell className="text-slate-700" size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-500 uppercase tracking-tighter">Kitchen is Clear</h2>
            <p className="text-slate-600 mt-2 font-bold uppercase tracking-widest text-xs">Waiting for incoming orders...</p>
          </motion.div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
