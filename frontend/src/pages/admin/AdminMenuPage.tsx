import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { MenuItem, Category } from '../../types';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Để hiển thị trong select box
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    description: '',
    categoryId: '',
    isChefRecommended: false
  });

  const fetchData = async () => {
    const [itemsRes, catsRes] = await Promise.all([
      axiosClient.get('/admin/menu-items'),
      axiosClient.get('/admin/categories')
    ]);
    setItems(itemsRes.data);
    setCategories(catsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/menu-items', newItem);
      setIsModalOpen(false);
      fetchData(); // Load lại dữ liệu
    } catch (error) {
      alert("Lỗi thêm món (Hãy chắc chắn bạn đã chọn Danh mục)");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Thêm món mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Tên món</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Trạng thái</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM MÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddItem} className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Thêm món ăn mới</h2>
            
            <div className="space-y-3">
              <input 
                className="w-full border p-2 rounded"
                placeholder="Tên món"
                required
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
              <input 
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Giá (VNĐ)"
                required
                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
              />
              <textarea 
                className="w-full border p-2 rounded"
                placeholder="Mô tả món ăn..."
                rows={3}
                onChange={e => setNewItem({...newItem, description: e.target.value})}
              />
              
              <select 
                className="w-full border p-2 rounded"
                required
                onChange={e => setNewItem({...newItem, categoryId: e.target.value})}
                value={newItem.categoryId}
              >
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox"
                  checked={newItem.isChefRecommended}
                  onChange={e => setNewItem({...newItem, isChefRecommended: e.target.checked})}
                />
                <span>Món gợi ý bởi đầu bếp (Chef's Choice)</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Lưu</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}