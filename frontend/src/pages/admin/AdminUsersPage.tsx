import React, { useEffect, useState, useMemo } from 'react';
import { userApi } from '../../api/userApi';
import { User, Role } from '../../types/user.types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable, SearchInput, SelectFilter, Pagination, Column, SortConfig } from '../../components/common';
import { UserFormModal } from '../../components/admin/UserFormModal';

const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({ role: Role.CUSTOMER, page: 1, limit: 1000 });
      setAllUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const processedUsers = useMemo(() => {
    let result = [...allUsers];

    if (filterStatus !== '') {
      const isActive = filterStatus === 'true';
      result = result.filter(u => u.isActive === isActive);
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortConfig.direction === 'asc' ? -diff : diff;
      }
      if (sortConfig.key === 'fullName') {
        const cmp = a.fullName.localeCompare(b.fullName);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return result;
  }, [allUsers, filterStatus, search, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
  const paginatedUsers = processedUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await userApi.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (editingUser?.id) {
      const updateData = { ...formData, role: Role.CUSTOMER };
      if (!updateData.password) delete updateData.password;
      await userApi.updateUser(editingUser.id, updateData);
    } else {
      await userApi.createUser({ ...formData, role: Role.CUSTOMER });
    }
    fetchUsers();
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
      render: (user) => <span className="font-bold text-gray-900">{user.fullName}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => <span className="text-sm text-gray-600">{user.email}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Customer Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Total: {processedUsers.length}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm"
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sticky top-0 bg-white z-10 py-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search customers (Name, Email)..."
          className="flex-1"
        />
        <SelectFilter
          value={filterStatus}
          onChange={setFilterStatus}
          options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
          placeholder="All Statuses"
          showIcon
          className="w-full md:w-48"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedUsers}
          loading={loading}
          keyExtractor={(u) => u.id}
          emptyMessage="No customers found."
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingUser || undefined}
        allowedRoles={[Role.CUSTOMER]}
        onSubmit={handleSubmit}
        title={editingUser ? 'Edit Customer' : 'Add New Customer'}
        isEditing={!!editingUser}
      />
    </div>
  );
};

export default AdminUsersPage;
