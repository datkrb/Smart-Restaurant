import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface Category {
  id: string;
  name: string;
  _count?: { menuItems: number };
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Hàm load danh sách
  const fetchCategories = () => {
    axiosClient.get('/admin/categories').then(res => setCategories(res.data));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const RESTAURANT_ID = "37f51c2d-d366-4d01-9e66-1d1a17dbae3b"; 
      
      await axiosClient.post('/admin/categories', {
        name: newCategoryName,
        restaurantId: RESTAURANT_ID 
      });
      
      setIsModalOpen(false);
      setNewCategoryName('');
      fetchCategories(); // Load lại sau khi thêm
    } catch (error) {
      alert("Lỗi thêm danh mục (Kiểm tra lại restaurantId)");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
            <p className="text-gray-500 text-sm mb-4">
              {cat._count?.menuItems || 0} món ăn
            </p>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm font-medium">Sửa</button>
              <button className="text-red-600 text-sm font-medium">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL THÊM DANH MỤC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">Thêm danh mục mới</h2>
            <input 
              className="w-full border p-2 rounded mb-4"
              placeholder="Tên danh mục (VD: Đồ uống)"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Lưu</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}