import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { User, Role } from '../../types/user.types';
import { Search } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search]); // Re-fetch when page or search changes

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({
        role: Role.CUSTOMER,
        page,
        limit: 10,
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Danh sách khách hàng và thông tin thành viên</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
             <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
             </div>
        ) : users.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                Không tìm thấy khách hàng nào.
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{user.fullName}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
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

export default AdminUsersPage;

