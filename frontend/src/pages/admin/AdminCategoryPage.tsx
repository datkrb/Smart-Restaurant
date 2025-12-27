import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface Category {
  id: string;
  name: string;
  _count: { menuItems: number };
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    axiosClient.get('/admin/categories').then(res => setCategories(res.data));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Thêm danh mục</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{cat._count.menuItems} món ăn</p>
            <div className="flex gap-2">
              <button className="text-blue-600 text-sm font-medium">Sửa</button>
              <button className="text-red-600 text-sm font-medium">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}