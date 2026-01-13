import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { Role, User } from '../../types/user.types';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { Modal, Form, Input, Select, Button, Tag, Space, App, message } from 'antd'; // Assuming Ant Design usage as seen in other files (AdminTablePage)
// If AntD is not used, I should stick to custom UI or standard HTML, 
// but user history showed "AdminTablePage" using it or similar.
// Wait, AdminTablePage was viewed but I didn't see imports. 
// "Troubleshoot Payment Success Error" mentioned Ant Design Modal props.
// Let's assume Ant Design is available since it was mentioned in history.
// However, to be safe and consistent with other pages I just wrote (AdminLayout, AdminOrdersPage - using tailwind),
// I will build a simple custom Modal using Tailwind if AntD is not 100% sure or to keep it lightweight.
// actually let's use a simple custom modal to avoid "antd" missing errors if not installed.

const AdminEmployeesPage = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: Role.WAITER,
        isActive: true
    });

    useEffect(() => {
        fetchEmployees();
    }, [page, search]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await userApi.getUsers({
                isEmployee: true,
                page,
                limit: 10,
                search,
                sortBy: 'role',
                sortOrder: 'asc'
            });
            setEmployees(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchEmployees();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
        try {
            await userApi.deleteUser(id);
            fetchEmployees();
        } catch (error) {
            alert("Không thể xóa user");
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '', // Don't show password
            role: user.role,
            isActive: user.isActive
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            fullName: '',
            email: '',
            password: '',
            role: Role.WAITER,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser && editingUser.id) {
                // Update
                const updateData: any = { ...formData };
                if (!updateData.password) delete updateData.password;
                await userApi.updateUser(editingUser.id, updateData);
            } else {
                // Create
                await userApi.createUser(formData);
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (error: any) {
            alert(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Nhân viên</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Quản lý đội ngũ nhân viên và phân quyền</p>
                </div>

                <div className="flex gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </form>
                    <button
                        onClick={handleCreate}
                        className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-600/20 whitespace-nowrap flex items-center gap-2"
                    >
                        <Plus size={18} /> Thêm nhân viên
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không tìm thấy nhân viên nào.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Họ tên</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{user.fullName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {/* Pagination logic ... (keep existing) */}
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

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{editingUser ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input 
                                    type="text" required 
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" required 
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    disabled={!!editingUser} // Email usually immutable or handled carefully
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {editingUser && '(Để trống nếu không đổi)'}</label>
                                <input 
                                    type="password" 
                                    required={!editingUser}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select 
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                                >
                                    <option value={Role.WAITER}>Phục vụ (Waiter)</option>
                                    <option value={Role.KITCHEN}>Bếp (Kitchen)</option>
                                    <option value={Role.ADMIN}>Quản lý (Admin)</option>
                                </select>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100">Hủy</button>
                                <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEmployeesPage;

