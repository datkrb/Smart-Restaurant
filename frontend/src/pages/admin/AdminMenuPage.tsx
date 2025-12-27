import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { MenuItem } from '../../types';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    axiosClient.get('/admin/menu-items').then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Thêm món mới</button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Tên món</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-500">{(item as any).category?.name}</td>
                <td className="p-4 font-bold text-orange-600">{item.price.toLocaleString()}đ</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="text-blue-600 hover:underline">Sửa</button>
                  <button className="text-red-600 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}