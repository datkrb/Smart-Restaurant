import React, { useEffect, useState } from 'react';
import { waiterApi } from '../../api/waiterApi';
import { ShoppingBag, User, CheckCircle, Clock } from 'lucide-react';

interface TableWithSession {
    id: string;
    name: string;
    capacity: number;
    sessions: {
        id: string;
        status: string;
        order?: {
            id: string;
            status: string;
            totalAmount: number;
        }
    }[];
}

import { useSocketStore } from '../../store/useSocketStore';
import { toast } from 'react-hot-toast';

export default function TableMapPage() {
    const [tables, setTables] = useState<TableWithSession[]>([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocketStore(state => state.socket);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const res = await waiterApi.getAssignedTables();
            setTables(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bàn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();

        if (socket) {
            socket.on('order_status_updated', (updatedOrder: any) => {
                // Tự động reload data khi có thay đổi trạng thái đơn của bàn
                fetchTables();
                if (updatedOrder.status === 'READY') {
                    toast.success(`Món bàn ${updatedOrder.tableSession.table.name} đã sẵn sàng!`, { icon: '🛎️' });
                }
            });

            socket.on('new_order', () => {
                fetchTables();
            });
        }

        return () => {
            socket?.off('order_status_updated');
            socket?.off('new_order');
        };
    }, [socket]);

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">Sơ đồ bàn được giao 🗺️</h1>
                <p className="text-gray-500 text-sm">Quản lý trạng thái các bàn bạn phụ trách</p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                </div>
            ) : tables.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                    <p className="text-gray-400">Bạn chưa được phân công bàn nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {tables.map(table => {
                        const activeSession = table.sessions[0];
                        const hasOrder = !!activeSession?.order;
                        const orderStatus = activeSession?.order?.status;

                        return (
                            <div
                                key={table.id}
                                className={`relative bg-white rounded-3xl p-5 border-2 transition-all shadow-sm flex flex-col items-center gap-3 ${hasOrder ? 'border-orange-500 bg-orange-50/10' : 'border-gray-100'
                                    }`}
                            >
                                {/* Table Icon/Shape */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${hasOrder ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <span className="text-xl font-black">{table.name.replace('Bàn ', '')}</span>
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900">{table.name}</h3>
                                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium">
                                        <User size={10} /> {table.capacity} chỗ
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="w-full mt-2">
                                    {hasOrder ? (
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded-full text-center uppercase tracking-wider ${orderStatus === 'READY' ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {orderStatus === 'READY' ? 'Sẵn sàng phục vụ' :
                                                    orderStatus === 'PREPARING' ? 'Đang chế biến' : 'Đã nhận đơn'}
                                            </span>
                                            <span className="text-[11px] font-black text-gray-700 text-center">
                                                {activeSession.order?.totalAmount.toLocaleString()}đ
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="block text-[9px] font-bold bg-gray-100 text-gray-400 px-2 py-1 rounded-full text-center uppercase tracking-wider">
                                            Bàn trống
                                        </span>
                                    )}
                                </div>

                                {/* Indicators */}
                                {hasOrder && orderStatus === 'READY' && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                        <CheckCircle size={14} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
