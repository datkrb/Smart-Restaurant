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
    ShieldAlert
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { reportApi, DashboardStats, RevenueData, TopSellingItem, UserStats } from '../../api/reportApi';
import { useAuthStore } from '../../store/useAuthStore';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const AdminDashboardPage = () => {
    const user = useAuthStore(state => state.user);

    // Default: Today
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, 16),
        end: new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 16)
    });

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // Kiểm tra quyền trước khi fetch
        if (!user || !ALLOWED_ROLES.includes(user.role)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { start, end } = dateRange;
            const isoStart = new Date(start).toISOString();
            const isoEnd = new Date(end).toISOString();

            const [statsRes, revenueRes, topRes, userRes] = await Promise.all([
                reportApi.getDashboardStats(isoStart, isoEnd),
                reportApi.getRevenueByDate(isoStart, isoEnd),
                reportApi.getTopSellingItems(), // Top items usually global or we can add params later
                reportApi.getUserStats(isoStart, isoEnd)
            ]);

            setStats(statsRes);
            setRevenueData(revenueRes);
            setTopSelling(topRes);
            setUserStats(userRes);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, user]); // Thêm user vào dependency để re-check khi logout

    const setQuickFilter = (type: '1h' | 'today' | '7d' | '30d') => {
        const now = new Date();
        const end = now.toISOString().slice(0, 16);
        let start = new Date().toISOString().slice(0, 16);

        if (type === '1h') {
            const d = new Date();
            d.setHours(d.getHours() - 1);
            start = d.toISOString().slice(0, 16);
        } else if (type === 'today') {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            start = d.toISOString().slice(0, 16);
        } else if (type === '7d') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().slice(0, 16);
        } else if (type === '30d') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString().slice(0, 16);
        }
        setDateRange({ start, end });
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Kiểm tra quyền truy cập cho UI
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                    <ShieldAlert size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h1>
                <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Tổng quan</h1>
                    <p className="text-sm text-gray-500 font-medium">Thống kê hoạt động kinh doanh</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setQuickFilter('1h')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">1h</button>
                        <button onClick={() => setQuickFilter('today')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">Hôm nay</button>
                        <button onClick={() => setQuickFilter('7d')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">7 ngày</button>
                        <button onClick={() => setQuickFilter('30d')} className="px-3 py-1 text-xs font-bold rounded hover:bg-white hover:shadow-sm transition text-gray-600">30 ngày</button>
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
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Doanh thu</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{formatCurrency(stats?.revenue || 0)}</h3>
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><DollarSign size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Đơn hàng</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{stats?.orders || 0}</h3>
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Khách mới</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-black text-gray-900">{userStats?.newUsers || 0}</h3>
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><UserPlus size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Bàn đang mở</p>
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
                                <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>
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
                                                // Make axis smarter? If hourly, show HH:mm, if daily show DD/MM
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
                                <Award className="text-yellow-500" size={20} /> Khách hàng VIP
                            </h3>
                            <div className="space-y-4">
                                {userStats?.topSpenders.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-4">Chưa có dữ liệu.</div>
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

                            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Món bán chạy</h3>
                            <div className="space-y-4">
                                {topSelling.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
                                            <p className="font-medium text-gray-700">{item.name}</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{item.quantity} đã bán</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboardPage;
