import React, { useEffect, useState, useMemo } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category.types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'menuItems'; direction: 'asc' | 'desc' } | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
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
        // UPDATE
        await categoryApi.updateCategory(editingCategory.id, newCategoryName);
      } else {
        // CREATE
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
      const msg = error.response?.data?.message || "Failed to delete category";
      alert(msg);
    }
  }

  const handleSort = (key: 'name' | 'menuItems') => {
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
          // Use localeCompare for correct Vietnamese sorting
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

  const renderSortIcon = (key: 'name' | 'menuItems') => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="text-orange-600" />
      : <ArrowDown size={14} className="text-orange-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Category List</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search category..."
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            + Add New
          </button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-500 uppercase text-sm">
            <th
              className="pb-3 cursor-pointer hover:text-gray-700 select-none group"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name {renderSortIcon('name')}
              </div>
            </th>
            <th
              className="pb-3 text-center cursor-pointer hover:text-gray-700 select-none group"
              onClick={() => handleSort('menuItems')}
            >
              <div className="flex items-center justify-center gap-1">
                Item Count {renderSortIcon('menuItems')}
              </div>
            </th>
            <th className="pb-3 text-center">Status</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredAndSortedCategories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 font-medium">{cat.name}</td>
              <td className="py-4 text-center">{cat.menuItems?.length || 0}</td>
              <td className="py-4 text-center">
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                  Active
                </span>
              </td>
              <td className="py-4 text-right space-x-2">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredAndSortedCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                {searchTerm ? "No matching categories found" : "No categories yet"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL THÊM/SỬA DANH MỤC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSaveCategory} className="bg-white p-6 rounded-xl w-96 shadow-lg transform transition-all scale-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editingCategory ? "Update Category" : "Add New Category"}
            </h2>
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
        </div>
      )}
    </div>
  );
}