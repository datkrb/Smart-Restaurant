import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { MenuItem, Category } from '../../types';
import PhotoManager from '../../modules/admin/PhotoManager';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ui } from '../../utils/swalHelper';

const MySwal = withReactContent(Swal);

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Để hiển thị trong select box

  // Quản lý trạng thái món đang chỉnh sửa
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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

    const updatedItems = itemsRes as any;
    setItems(updatedItems);
    setCategories(catsRes as any);

    if (editingItem) {
      const freshItem = updatedItems.find((i: MenuItem) => i.id === editingItem.id);
      if (freshItem) setEditingItem(freshItem);
    }
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

  const handleDeleteItem = async (itemId: string) => {
    const result = await ui.confirmDelete(
      "Gỡ bỏ món ăn?",
      "Món ăn sẽ không hiển thị trên thực đơn khách hàng nhưng vẫn lưu trong lịch sử báo cáo."
    );

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/admin/menu-items/${itemId}`);
        ui.alertSuccess("Đã cập nhật trạng thái món ăn");
        fetchData(); // Tải lại danh sách
      } catch (err) {
        ui.alertError("Lỗi hệ thống");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          + Thêm món mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Ảnh</th>
              <th className="p-4">Tên món</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                    {/* Sử dụng optional chaining ?. để an toàn */}
                    {item.photos?.some(p => p.isPrimary) ? (
                      <img
                        src={item.photos.find(p => p.isPrimary)?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">No Img</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-500">{(item as any).category?.name}</td>
                <td className="p-4 font-bold text-orange-600">{item.price.toLocaleString()}đ</td>
                <td className="p-4">
                  <button
                    onClick={() => setEditingItem(item)} // Mở modal quản lý ảnh/sửa
                    className="text-blue-600 hover:underline text-sm font-medium cursor-pointer"
                  >
                    Sửa & Ảnh
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHỈNH SỬA & QUẢN LÝ ẢNH */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Chỉnh sửa: {editingItem.name}</h2>

            <PhotoManager
              itemId={editingItem.id}
              photos={editingItem.photos || []}
              onRefresh={fetchData}
            />

            <div className="mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="w-full bg-gray-200 py-2 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
              <input
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Giá (VNĐ)"
                required
                onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Mô tả món ăn..."
                rows={3}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              />

              <select
                className="w-full border p-2 rounded"
                required
                onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}
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
                  onChange={e => setNewItem({ ...newItem, isChefRecommended: e.target.checked })}
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