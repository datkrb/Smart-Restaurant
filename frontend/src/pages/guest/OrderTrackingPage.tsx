import React, { useEffect, useState } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { useSocketStore } from '../../store/useSocketStore';
import { guestApi } from '../../api/guestApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    menuItem: {
        name: string;
        price: number;
    };
    modifiers: any[];
    status: string; // Added status
}

interface Order {
    id: string;
    status: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED';
    totalAmount: number;
    items: OrderItem[];
    billRequested: boolean;
    tableSession: {
        table: {
            name: string;
        }
    }
}

const STEPS = ['RECEIVED', 'PREPARING', 'READY'];

const OrderTrackingPage = () => {
    const { sessionId } = useSessionStore();
    const socket = useSocketStore(state => state.socket);
    const joinRoom = useSocketStore(state => state.joinRoom);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestingBill, setRequestingBill] = useState(false);

    const fetchOrder = async () => {
        if (!sessionId) return;
        try {
            const res = await guestApi.getOrderDetails(sessionId);
            setOrder(res as any);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Join session room for real-time notifications
    useEffect(() => {
        if (socket?.connected && sessionId) {
            joinRoom({ role: 'CUSTOMER', tableSessionId: sessionId });
        }
    }, [socket, sessionId, joinRoom]);

    // Socket.IO event listeners
    useEffect(() => {
        if (!socket) return;

        // Listen for order ready notification
        socket.on('order_ready', (data: any) => {
            toast.success('🍽️ Your order is ready!', { duration: 5000 });
            fetchOrder(); // Refresh order data
        });

        // Listen for order served notification
        socket.on('order_served', (data: any) => {
            toast.success('✅ Your order has been served!', { duration: 5000 });
            fetchOrder();
        });

        // Listen for any status change
        socket.on('order_status_change', (data: any) => {
            fetchOrder();
        });

        return () => {
            socket.off('order_ready');
            socket.off('order_served');
            socket.off('order_status_change');
        };
    }, [socket]);

    useEffect(() => {
        fetchOrder();
        // Reduce polling frequency since we have real-time updates now
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [sessionId]);

    const handleRequestBill = async () => {
        if (!order) return;
        try {
            setRequestingBill(true);
            await guestApi.requestBill(order.id);
            await fetchOrder();
        } catch (err) {
            console.error("Failed to request bill", err);
        } finally {
            setRequestingBill(false);
        }
    }

    if (!sessionId) return <div className="p-4 text-center">Session not found. Please scan QR code again.</div>;
    if (loading) return <div className="p-4 text-center">Loading order...</div>;
    if (!order) return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
            <h2 className="text-xl font-bold mb-4">No active order found.</h2>
            <Link to="/menu" className="px-6 py-2 bg-orange-600 text-white rounded-full font-bold">
                Browse Menu
            </Link>
        </div>
    );

    // Map backend status to our simplified 3 steps
    // RECEIVED, PREPARING, READY.
    // If Served/Completed, assume it's past Ready.
    const getStatusIndex = (status: string) => {
        if (status === 'RECEIVED') return 0;
        if (status === 'PREPARING') return 1;
        if (['READY', 'SERVED', 'COMPLETED'].includes(status)) return 2;
        return 0;
    };

    const currentStepIndex = getStatusIndex(order.status);

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
            {/* Page Title */}
            <div className="bg-white p-4 shadow-sm relative flex items-center justify-center">
                <Link to="/menu" className="absolute left-4 text-gray-500">
                    &larr; Back
                </Link>
                <h1 className="text-lg font-bold text-center">Order Status</h1>
            </div>

            {/* Stepper */}
            <div className="px-6 py-8 bg-white mb-2">
                <div className="flex items-center justify-between relative">
                    {/* Background Line */}
                    <div className="absolute left-0 top-[15px] w-full h-[2px] bg-gray-200 -z-0"></div>
                    {/* Active Line */}
                    <div
                        className="absolute left-0 top-[15px] h-[2px] bg-green-500 -z-0 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    {STEPS.map((step, index) => {
                        const isCompleted = currentStepIndex >= index;
                        const isCurrent = currentStepIndex === index;

                        return (
                            <div key={step} className="flex flex-col items-center z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300
                                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}
                                    ${isCurrent ? 'scale-125 shadow-lg ring-4 ring-green-100' : ''}
                                `}>
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider mt-2 font-bold ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">Status</p>
                    <p className="text-xl font-bold text-green-600 animate-pulse">{order.status.replace('_', ' ')}</p>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white m-3 rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="font-bold text-gray-700">Order Items</h2>
                    <span className="text-xs text-gray-400">#{order.id.slice(0, 8)}</span>
                </div>

                <div className="space-y-3">
                    {order.items.map((item, idx) => {
                        const modifierString = item.modifiers
                            ?.map((m: any) => m.modifierOption.name)
                            .sort()
                            .join(', ') || '';

                        return (
                            <div key={item.id} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex justify-between font-medium text-gray-800">
                                        <span className={item.status === 'CANCELLED' ? 'line-through text-gray-400' : ''}>
                                            {item.menuItem.name}
                                            <span className="text-orange-600 ml-1 text-sm font-bold">x{item.quantity}</span>
                                        </span>
                                        <span className={item.status === 'CANCELLED' ? 'line-through text-gray-400' : ''}>
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>

                                    {modifierString && (
                                        <div className="text-xs text-gray-500 mt-1 pl-2 border-l-2 border-gray-200">
                                            {modifierString}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-dashed pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-600">Total Amount</span>
                    <span className="text-xl font-black text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
            </div>

            {/* Note */}
            < div className="bg-blue-50 m-3 p-3 rounded-lg text-blue-700 text-xs flex items-start gap-2">
                <span>ℹ️</span>
                <p>If you need extra assistance, please call the waiter explicitly or use the button below.</p>
            </div>

            {/* Bill Request and Bottom Actions */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <Link to="/menu" className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center hover:bg-gray-200 transition">
                    New Order
                </Link>

                {order.billRequested ? (
                    <button
                        disabled
                        className="flex-[2] py-3 bg-yellow-100 text-yellow-700 font-bold rounded-xl flex items-center justify-center cursor-not-allowed border border-yellow-200"
                    >
                        Wait for Bill...
                    </button>
                ) : (
                    <button
                        onClick={handleRequestBill}
                        disabled={requestingBill || order.status === 'COMPLETED'}
                        className={`flex-[2] py-3 font-bold rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 transition-all 
                            ${requestingBill
                                ? 'bg-gray-400'
                                : 'bg-green-600 hover:bg-green-700 active:scale-95'
                            }
                        `}
                    >
                        {requestingBill ? 'Requesting...' : 'Request Bill'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
