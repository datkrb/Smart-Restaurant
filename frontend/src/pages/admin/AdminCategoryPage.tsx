import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category.types';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
      alert(editingCategory ? "Lỗi cập nhật danh mục" : "Lỗi thêm danh mục");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await categoryApi.deleteCategory(id);
      fetchCategories();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi xóa danh mục";
      alert(msg);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Danh sách danh mục</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Thêm mới
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-500 uppercase text-sm">
            <th className="pb-3">Tên</th>
            <th className="pb-3 text-center">Số món</th>
            <th className="pb-3 text-center">Trạng thái</th>
            <th className="pb-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {categories.map((cat) => (
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
                  Sửa
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL THÊM/SỬA DANH MỤC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSaveCategory} className="bg-white p-6 rounded-xl w-96 shadow-lg transform transition-all scale-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h2>
            <input
              className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              placeholder="Tên danh mục (VD: Đồ uống)"
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
                  {editingCategory ? "Cập nhật" : "Lưu"}
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}