import React, { useEffect, useState, useMemo } from 'react';
import { userApi } from '../../api/userApi';
import { User, Role } from '../../types/user.types';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';

const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      role: Role.CUSTOMER,
      isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []); 

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch "all" users (limit 1000) for client-side processing
      const response = await userApi.getUsers({
        role: Role.CUSTOMER,
        page: 1,
        limit: 1000, 
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side Filtering & Sorting
  const processedUsers = useMemo(() => {
    let result = [...allUsers];

    // 1. Filter by Status
    if (filterStatus !== '') {
        const isActive = filterStatus === 'true';
        result = result.filter(u => u.isActive === isActive);
    }

    // 2. Filter by Search (Name or Email)
    if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(u => 
            u.fullName.toLowerCase().includes(lowerSearch) || 
            u.email.toLowerCase().includes(lowerSearch)
        );
    }

    // 3. Sorting
    result.sort((a, b) => {
        switch (sortBy) {
            case 'createdAt_desc':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'createdAt_asc':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'fullName_asc':
                return a.fullName.localeCompare(b.fullName);
            case 'fullName_desc':
                return b.fullName.localeCompare(a.fullName);
            default:
                return 0;
        }
    });

    return result;
  }, [allUsers, filterStatus, search, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
  const paginatedUsers = processedUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
        await userApi.deleteUser(id);
        fetchUsers();
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
        role: Role.CUSTOMER,
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
        role: Role.CUSTOMER,
        isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingUser && editingUser.id) {
              // Update
              const updateData: any = { ...formData, role: Role.CUSTOMER };
              if (!updateData.password) delete updateData.password;
              await userApi.updateUser(editingUser.id, updateData);
          } else {
              // Create
              await userApi.createUser({ ...formData, role: Role.CUSTOMER });
          }
          setIsModalOpen(false);
          fetchUsers();
      } catch (error: any) {
          alert(error.response?.data?.message || "Có lỗi xảy ra");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Danh sách khách hàng và thông tin thành viên (Tổng: {processedUsers.length})</p>
        </div>
        <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm hover:shadow-md whitespace-nowrap"
        >
            <Plus size={18} /> Thêm khách hàng
        </button>
      </div>

       {/* FILTER BAR */}
       <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-white z-10 py-2">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Tìm kiếm khách hàng (Tên, Email)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="w-full md:w-48 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select 
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="w-full md:w-48">
                <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                     <option value="createdAt_desc">Mới nhất</option>
                     <option value="createdAt_asc">Cũ nhất</option>
                     <option value="fullName_asc">Tên A-Z</option>
                     <option value="fullName_desc">Tên Z-A</option>
                </select>
            </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
             </div>
        ) : paginatedUsers.length === 0 ? (
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
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedUsers.map((user) => (
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

      {/* Modal CRUD Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{editingUser ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                        <input 
                            type="text" required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            placeholder="Nhập họ tên đầy đủ"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            disabled={!!editingUser} 
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {editingUser && '(Để trống nếu không đổi)'}</label>
                        <input 
                            type="password" 
                            required={!editingUser}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id="isActive"
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 select-none">Đang hoạt động (Active)</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">Hủy</button>
                        <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </div>
  );
};

export default AdminUsersPage;

