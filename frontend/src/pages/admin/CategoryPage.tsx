import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosClient.get('/admin/categories').then(res => setCategories(res as any));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Danh sách danh mục</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg">+ Thêm mới</button>
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
          {categories.map((cat: any) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="py-4 font-medium">{cat.name}</td>
              <td className="py-4 text-center">{cat._count?.menuItems || 0}</td>
              <td className="py-4 text-center">
                <span className={`px-2 py-1 rounded text-xs ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {cat.status || 'Active'}
                </span>
              </td>
              <td className="py-4 text-right space-x-2">
                <button className="text-blue-600 hover:underline">Sửa</button>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}