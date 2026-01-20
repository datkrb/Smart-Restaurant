import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    Users,
    DollarSign,
    TrendingUp,
    CreditCard,
    Utensils,
    Calendar,
    UserPlus,
    Award,
    ShieldAlert,
    Zap
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { reportApi, DashboardStats, RevenueData, TopSellingItem, UserStats } from '../../api/reportApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocketStore } from '../../store/useSocketStore';
import toast from 'react-hot-toast';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const AdminDashboardPage = () => {
    const user = useAuthStore(state => state.user);
    const socket = useSocketStore(state => state.socket);
    const joinRoom = useSocketStore(state => state.joinRoom);

    const toLocalISOString = (date: Date) => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Default: Today (Local Time)
    const [dateRange, setDateRange] = useState(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return {
            start: toLocalISOString(start),
            end: toLocalISOString(end)
        };
    });

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [paymentData, setPaymentData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    const fetchData = async () => {
        // Kiểm tra quyền trước khi fetch
        if (!user || !ALLOWED_ROLES.includes(user.role)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { start, end } = dateRange;
            // Convert Local Input String to UTC ISO for Backend
            const isoStart = new Date(start).toISOString();
            const isoEnd = new Date(end).toISOString();

            const [statsRes, revenueRes, topRes, userRes, catRes, payRes] = await Promise.all([
                reportApi.getDashboardStats(isoStart, isoEnd),
                reportApi.getRevenueByDate(isoStart, isoEnd),
                reportApi.getTopSellingItems(isoStart, isoEnd),
                reportApi.getUserStats(isoStart, isoEnd),
                reportApi.getCategoryStats(isoStart, isoEnd),
                reportApi.getPaymentStats(isoStart, isoEnd)
            ]);

            setStats(statsRes);
            setRevenueData(revenueRes);
            setTopSelling(topRes);
            setUserStats(userRes);
            setCategoryData(catRes);
            setPaymentData(payRes);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // Join admin room for real-time updates
    useEffect(() => {
        if (socket?.connected && user && ALLOWED_ROLES.includes(user.role)) {
            joinRoom({ role: 'ADMIN' });
            setIsLive(true);
        }
    }, [socket, user, joinRoom]);

    // Listen for real-time events
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (data: any) => {
            toast.success(`📦 New order from ${data.tableName || 'a table'}!`, { duration: 3000 });
            // Refresh stats
            fetchData();
        };

        const handleOrderComplete = () => {
            // Refresh stats when order completes (payment received)
            fetchData();
        };

        socket.on('new_order', handleNewOrder);
        socket.on('order_status_change', handleOrderComplete);

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('order_status_change', handleOrderComplete);
        };
    }, [socket, dateRange]);

    useEffect(() => {
        fetchData();
    }, [dateRange, user]); // Thêm user vào dependency để re-check khi logout

    const setQuickFilter = (type: '1h' | 'today' | '7d' | '30d') => {
        const now = new Date();
        const endStr = toLocalISOString(now);
        let start = new Date();

        if (type === '1h') {
            start.setHours(start.getHours() - 1);
        } else if (type === 'today') {
            start.setHours(0, 0, 0, 0);
            // End of today (not just 'now')? 
            // Usually 'Today' implies 00:00 to 23:59.
            // If I set End to 'now', I miss future orders if I don't refresh?
            // But if I filter by 'Today', I usually want 'Whole Day'.
            // Let's set End to 23:59:59 for 'today'.
            const e = new Date();
            e.setHours(23, 59, 59, 999);
            setDateRange({ start: toLocalISOString(start), end: toLocalISOString(e) });
            return;
        } else if (type === '7d') {
            start.setDate(start.getDate() - 7);
        } else if (type === '30d') {
            start.setDate(start.getDate() - 30);
        }
        
        setDateRange({ start: toLocalISOString(start), end: endStr });
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Kiểm tra quyền truy cập cho UI
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                    <ShieldAlert size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-500">You do not have permission to access this page.</p>
            </div>
        );
    }

    const COLORS = ['#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#f3f4f6'];

    return (
        <div className="flex flex-col gap-8 pb-10">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Overview</h1>
                        <p className="text-sm text-gray-500 font-medium">Business statistics</p>
                    </div>
                    {isLive && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            LIVE
                        </span>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setQuickFilter('1h')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">1h</button>
                        <button onClick={() => setQuickFilter('today')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">Today</button>
                        <button onClick={() => setQuickFilter('7d')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">7 Days</button>
                        <button onClick={() => setQuickFilter('30d')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">30 Days</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="datetime-local"
                            className="px-3 py-1.5 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="datetime-local"
                            className="px-3 py-1.5 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div></div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Revenue</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats?.revenue || 0)}</h3>
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><DollarSign size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Orders</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{stats?.orders || 0}</h3>
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">New Customers</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{userStats?.newUsers || 0}</h3>
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><UserPlus size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Guests</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{stats?.activeGuests || 0}</h3>
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Users size={24} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Chart Section */}
                        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Revenue Chart</h3>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            tickFormatter={(str) => {
                                                if (str.includes(':')) return str;
                                                const date = new Date(str);
                                                return `${date.getDate()}/${date.getMonth() + 1}`;
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            tickFormatter={(val) => `${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Spenders (VIP) */}
                        <div className="w-full lg:w-96 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Award className="text-yellow-500" size={20} /> VIP Customers
                            </h3>
                            <div className="space-y-4">
                                {userStats?.topSpenders.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-4">No data available.</div>
                                ) : (
                                    userStats?.topSpenders.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs ring-2 ring-white">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-orange-600 text-sm">{formatCurrency(user.totalSpent)}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Top Selling Items</h3>
                            <div className="space-y-4">
                                {topSelling.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
                                            <p className="font-medium text-gray-700">{item.name}</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{item.quantity} sold</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Sales Chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Category</h3>
                            <div className="h-64 w-full flex items-center justify-center">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-sm">No category data</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Method Chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Payment Methods</h3>
                            <div className="h-64 w-full flex items-center justify-center">
                                {paymentData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {paymentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-sm">No payment data</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboardPage;
