import React, { useEffect, useState, useMemo } from 'react';
import { userApi } from '../../api/userApi';
import { Role, User } from '../../types/user.types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable, SearchInput, SelectFilter, Pagination, Column, SortConfig } from '../../components/common';
import { UserFormModal } from '../../components/admin/UserFormModal';

const EMPLOYEE_ROLES = [Role.WAITER, Role.KITCHEN, Role.ADMIN];

const AdminEmployeesPage = () => {
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({ isEmployee: true, page: 1, limit: 1000 });
      setAllEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  const processedEmployees = useMemo(() => {
    let result = [...allEmployees];

    if (filterRole) {
      result = result.filter(u => u.role === filterRole);
    }

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
      if (sortConfig.key === 'role') {
        const cmp = a.role.localeCompare(b.role);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return result;
  }, [allEmployees, filterRole, filterStatus, search, sortConfig]);

  const totalPages = Math.ceil(processedEmployees.length / itemsPerPage);
  const paginatedEmployees = processedEmployees.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1); }, [search, filterRole, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await userApi.deleteUser(id);
      fetchEmployees();
    } catch (error) {
      alert("Failed to delete employee");
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
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await userApi.updateUser(editingUser.id, updateData);
    } else {
      await userApi.createUser(formData);
    }
    fetchEmployees();
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
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          {user.role}
        </span>
      ),
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
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Employee Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Total: {processedEmployees.length}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sticky top-0 bg-white z-10 py-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search employees (Name, Email)..."
          className="flex-1"
        />
        <SelectFilter
          value={filterRole}
          onChange={setFilterRole}
          options={EMPLOYEE_ROLES.map(r => ({ value: r, label: r }))}
          placeholder="All Roles"
          showIcon
          className="w-full md:w-40"
        />
        <SelectFilter
          value={filterStatus}
          onChange={setFilterStatus}
          options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
          placeholder="All Statuses"
          className="w-full md:w-40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={paginatedEmployees}
          loading={loading}
          keyExtractor={(u) => u.id}
          emptyMessage="No employees found."
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingUser || undefined}
        allowedRoles={EMPLOYEE_ROLES}
        onSubmit={handleSubmit}
        title={editingUser ? 'Edit Employee' : 'Add Employee'}
        isEditing={!!editingUser}
      />
    </div>
  );
};

export default AdminEmployeesPage;
