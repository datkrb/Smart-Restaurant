import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../store/useAuthStore';
import {
    User, Mail, Calendar, Shield, Save, ArrowLeft, Camera, Lock,
    Eye, EyeOff, ShoppingBag, Clock, ChevronRight, Package, LogOut
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';

interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    status: string;
    note?: string;
    menuItem: {
        id: string;
        name: string;
        photos?: { url: string }[];
    };
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
    tableSession?: {
        table?: { name: string };
    };
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser, login, logout } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders'>('profile');

    // Profile state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    // Avatar state
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Order history state
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotalPages, setOrdersTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrderHistory();
        }
    }, [activeTab, ordersPage]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getProfile();
            const userData = response.data?.data || response.data;
            if (!userData || !userData.fullName) {
                throw new Error('Invalid profile data received');
            }
            setProfile(userData);
            setFullName(userData.fullName);
        } catch (err: any) {
            console.error('Failed to fetch profile:', err);
            setError(err.response?.data?.message || 'Failed to load profile');
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            setOrdersLoading(true);
            const response = await userApi.getOrderHistory(ordersPage, 10);
            const responseData = response.data;
            const ordersData = responseData?.data || responseData || [];
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            if (responseData?.pagination) {
                setOrdersTotalPages(responseData.pagination.totalPages || 1);
            }
        } catch (err: any) {
            console.error('Failed to fetch order history:', err);
            toast.error('Failed to load order history');
        } finally {
            setOrdersLoading(false);
        }
    };

    const validateFullName = (name: string): string | null => {
        const trimmedName = name.trim();
        if (!trimmedName) return 'Full name is required';
        if (trimmedName.length < 2) return 'Full name must be at least 2 characters';
        if (trimmedName.length > 100) return 'Full name must not exceed 100 characters';
        return null;
    };

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFullName(newValue);
        setValidationError(validateFullName(newValue) || '');
    };

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const validationErr = validateFullName(fullName);
        if (validationErr) {
            setValidationError(validationErr);
            return;
        }
        if (fullName.trim() === profile?.fullName) {
            toast.success('No changes to save');
            return;
        }
        try {
            setIsSaving(true);
            const response = await userApi.updateProfile({ fullName: fullName.trim() });
            const updatedUser = response.data?.data || response.data;
            setProfile(prev => prev ? { ...prev, fullName: updatedUser.fullName } : null);
            if (authUser) {
                login({ ...authUser, fullName: updatedUser.fullName }, localStorage.getItem('accessToken') || '', localStorage.getItem('refreshToken') || '');
            }
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to update profile';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        try {
            setIsUploadingAvatar(true);
            const response = await userApi.uploadAvatar(file);
            const updatedUser = response.data?.data || response.data;
            setProfile(prev => prev ? { ...prev, avatarUrl: updatedUser.avatarUrl } : null);
            if (authUser) {
                login({ ...authUser, avatarUrl: updatedUser.avatarUrl }, localStorage.getItem('accessToken') || '', localStorage.getItem('refreshToken') || '');
            }
            toast.success('Avatar updated successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        try {
            setIsChangingPassword(true);
            await userApi.changePassword({ currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to change password';
            setPasswordError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'PREPARING': return 'bg-yellow-100 text-yellow-700';
            case 'READY': return 'bg-blue-100 text-blue-700';
            case 'SERVED': return 'bg-purple-100 text-purple-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4 text-sm">Failed to load profile</p>
                    <Button onClick={() => navigate('/')} size="sm">Go Home</Button>
                </div>
            </div>
        );
    }

    const avatarUrl = profile.avatarUrl
        ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `http://localhost:4000${profile.avatarUrl}`)
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile-optimized Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Back</span>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">My Profile</h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-4 pb-24">
                {/* Profile Card - Mobile optimized */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden cursor-pointer group"
                                    onClick={handleAvatarClick}
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-orange-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        {isUploadingAvatar ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <Camera size={20} className="text-white" />
                                        )}
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{profile.fullName}</h2>
                                <p className="text-gray-500 text-sm truncate">{profile.email}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${profile.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        <Shield size={10} />
                                        {profile.isVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Mobile optimized */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        {['profile', 'password', 'orders'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'profile' && <User size={16} className="inline mr-1 sm:mr-2" />}
                                {tab === 'password' && <Lock size={16} className="inline mr-1 sm:mr-2" />}
                                {tab === 'orders' && <ShoppingBag size={16} className="inline mr-1 sm:mr-2" />}
                                <span className="capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSubmitProfile} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
                                )}
                                <Input
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    required
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    leftIcon={<User size={18} />}
                                    error={validationError}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                        <Mail size={18} className="text-gray-400" />
                                        <span className="text-gray-500 truncate flex-1">{profile.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span className="text-gray-500">{formatDate(profile.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" isLoading={isSaving} disabled={!!validationError || fullName.trim() === profile.fullName} size="sm" fullWidth>
                                        <Save size={16} className="mr-1" /> Save
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setFullName(profile.fullName); setValidationError(''); setError(''); }} disabled={fullName === profile.fullName}>
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {passwordError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{passwordError}</div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        leftIcon={<Lock size={18} />}
                                        rightIcon={
                                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-gray-400">
                                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        leftIcon={<Lock size={18} />}
                                        rightIcon={
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-gray-400">
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        leftIcon={<Lock size={18} />}
                                    />
                                </div>
                                <Button type="submit" isLoading={isChangingPassword} disabled={!currentPassword || !newPassword || !confirmPassword} size="sm" fullWidth>
                                    <Lock size={16} className="mr-1" /> Change Password
                                </Button>
                            </form>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                {ordersLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                                        <p className="text-gray-500 text-sm">Loading orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 text-sm">No orders yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Your order history will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer bg-white"
                                                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-gray-800 text-sm">
                                                                #{order.id.slice(-6).toUpperCase()}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                            <Clock size={12} />
                                                            <span>{formatDateTime(order.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-orange-600 text-sm">{order.totalAmount.toLocaleString()}đ</p>
                                                        <p className="text-xs text-gray-400">{order.items.length} items</p>
                                                    </div>
                                                </div>

                                                {selectedOrder?.id === order.id && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                                            <Package size={14} /> Item Status
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                                        {item.menuItem.photos?.[0]?.url ? (
                                                                            <img src={`http://localhost:4000${item.menuItem.photos[0].url}`} alt={item.menuItem.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ShoppingBag size={14} className="text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-800 text-xs truncate">{item.menuItem.name}</p>
                                                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                                    </div>
                                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-2 flex items-center justify-end text-xs text-orange-500">
                                                    <span>{selectedOrder?.id === order.id ? 'Hide' : 'Details'}</span>
                                                    <ChevronRight size={14} className={`transform transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                        ))}

                                        {ordersTotalPages > 1 && (
                                            <div className="flex justify-center gap-2 mt-4">
                                                <Button variant="outline" size="sm" disabled={ordersPage === 1} onClick={() => setOrdersPage(p => p - 1)}>
                                                    Prev
                                                </Button>
                                                <span className="px-3 py-1.5 text-xs text-gray-500">
                                                    {ordersPage}/{ordersTotalPages}
                                                </span>
                                                <Button variant="outline" size="sm" disabled={ordersPage === ordersTotalPages} onClick={() => setOrdersPage(p => p + 1)}>
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
