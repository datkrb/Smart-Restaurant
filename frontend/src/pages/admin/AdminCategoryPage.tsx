import React, { useEffect, useState, useMemo } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category.types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Modal, DataTable, SearchInput, Column, SortConfig } from '../../components/common';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, newCategoryName);
      } else {
        await categoryApi.createCategory(newCategoryName);
      }
      setIsModalOpen(false);
      setNewCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      alert(editingCategory ? "Failed to update category" : "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryApi.deleteCategory(id);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = [...categories];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(cat => cat.name.toLowerCase().includes(lowerTerm));
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'menuItems') {
          const aCount = a.menuItems?.length || 0;
          const bCount = b.menuItems?.length || 0;
          return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount;
        }
        return 0;
      });
    }

    return filtered;
  }, [categories, searchTerm, sortConfig]);

  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (cat) => <span className="font-medium">{cat.name}</span>,
    },
    {
      key: 'menuItems',
      label: 'Item Count',
      sortable: true,
      headerClassName: 'text-center',
      className: 'text-center',
      render: (cat) => cat.menuItems?.length || 0,
    },
    {
      key: 'status',
      label: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      render: () => (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
          Active
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (cat) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(cat); }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Category List</h2>
        <div className="flex gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search category..."
            className="w-64"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAndSortedCategories}
        loading={loading}
        keyExtractor={(cat) => cat.id}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyMessage={searchTerm ? "No matching categories found" : "No categories yet"}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Update Category" : "Add New Category"}
        size="sm"
      >
        <form onSubmit={handleSaveCategory}>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            placeholder="Category Name (e.g. Drinks)"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              {editingCategory ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}