import React, { useEffect, useState } from 'react';
import { MenuItem } from '../../types';
import { Category } from '../../types/category.types';
import PhotoManager from '../../modules/admin/PhotoManager';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ui } from '../../utils/swalHelper';
import { menuApi } from '../../api/menuApi';
import { categoryApi } from '../../api/categoryApi';
import { CreateMenuItemRequest } from '../../types/menu.types';
import { Edit, Trash2, Plus, X, Search, Filter, Camera } from 'lucide-react'; // Import icons if available, assuming lucide-react is used in project

const MySwal = withReactContent(Swal);

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Separate state for edit modal
  
  const [newItem, setNewItem] = useState<CreateMenuItemRequest>({
    name: '',
    price: 0,
    description: '',
    categoryId: '',
    isChefRecommended: false,
    status: 'AVAILABLE'
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<CreateMenuItemRequest>>({});
  const fetchData = async () => {
    try {
      const [menuRes, catsRes] = await Promise.all([
        menuApi.getMenuItems({ limit: 1000 }), 
        categoryApi.getAllCategories()
      ]);
      console.log("DEBUG: Menu API Response:", menuRes);

      // Ensure we treat the response correctly
      // Ensure we treat the response correctly
      // Api unwraps data, so menuRes is the body { message, menuItems: { data: [], meta: ... } }
      if (menuRes && menuRes.menuItems) {
          setItems(menuRes.menuItems.data || []);
      }
      
      setCategories(Array.isArray(catsRes) ? catsRes : []);

      if (editingItem) {
        // Refresh editing item if it exists
        const freshItem = menuRes?.menuItems?.data?.find((i: MenuItem) => i.id === editingItem.id);
        if (freshItem) {
            setEditingItem(freshItem);
            // Also update edit form data if open
            setEditFormData({
                name: freshItem.name,
                price: freshItem.price,
                description: freshItem.description,
                categoryId: freshItem.categoryId,
                isChefRecommended: freshItem.isChefRecommended,
                status: freshItem.status
            });
        }
      }
    } catch (error) {
       console.error("Error fetching data", error);
       // ui.alertError("Lỗi tải dữ liệu"); // Suppress error on init to avoid spam if DB is empty
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await menuApi.createMenuItem(newItem);
      setIsModalOpen(false);
      setNewItem({
        name: '',
        price: 0,
        description: '',
        categoryId: '',
        isChefRecommended: false,
        status: 'AVAILABLE'
      });
      ui.alertSuccess("Đã thêm món mới");
      fetchData(); 
    } catch (error) {
      ui.alertError("Lỗi thêm món (Hãy chắc chắn bạn đã chọn Danh mục)");
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingItem) return;

      try {
          await menuApi.updateMenuItem(editingItem.id, editFormData);
          setIsEditModalOpen(false);
          setEditingItem(null);
          ui.alertSuccess("Đã cập nhật món ăn");
          fetchData();
      } catch (error) {
          ui.alertError("Lỗi cập nhật món ăn");
      }
  }

  const handleDeleteItem = async (itemId: string) => {
    const result = await ui.confirmDelete(
      "Gỡ bỏ món ăn?",
      "Món ăn sẽ không hiển thị trên thực đơn khách hàng nhưng vẫn lưu trong lịch sử báo cáo."
    );

    if (result.isConfirmed) {
      try {
        await menuApi.deleteMenuItem(itemId);
        ui.alertSuccess("Đã xóa món ăn");
        fetchData(); 
      } catch (err) {
        ui.alertError("Lỗi hệ thống");
      }
    }
  };

  const openEditModal = (item: MenuItem) => {
      setEditingItem(item);
      setEditFormData({
        name: item.name,
        price: item.price,
        description: item.description || '',
        categoryId: item.categoryId,
        isChefRecommended: item.isChefRecommended,
        status: item.status
      });
      setIsEditModalOpen(true);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý thực đơn</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý danh sách món ăn, giá cả và hình ảnh</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <span>+ Thêm món mới</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold w-24">Hình ảnh</th>
              <th className="p-4 font-semibold">Tên món</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Giá bán</th>
              <th className="p-4 font-semibold text-center">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="p-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center relative">
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
                <td className="p-4">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.isChefRecommended && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700 font-medium mt-1">
                            Chef's Choice
                        </span>
                    )}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {item.category?.name || categories.find(c => c.id === item.categoryId)?.name}
                </td>
                <td className="p-4 font-bold text-orange-600">
                    {item.price.toLocaleString()}đ
                </td>
                <td className="p-4 text-center">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                       item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                       item.status === 'SOLD_OUT' ? 'bg-red-100 text-red-700' :
                       'bg-gray-100 text-gray-700'
                   }`}>
                       {item.status === 'AVAILABLE' ? 'Đang bán' : 
                        item.status === 'SOLD_OUT' ? 'Hết hàng' : 'Ẩn'}
                   </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {items.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                Chưa có món ăn nào.
            </div>
        )}
      </div>

      {/* MODAL EDIT */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa món</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
             </div>
             
             <div className="overflow-y-auto p-6 space-y-8">
                {/* Photo Manager Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Hình ảnh</h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <PhotoManager
                            itemId={editingItem.id}
                            photos={editingItem.photos || []}
                            onRefresh={fetchData}
                        />
                    </div>
                </section>

                {/* Edit Form Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Thông tin chi tiết</h3>
                    <form id="edit-form" onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn</label>
                             <input
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                value={editFormData.name}
                                onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                required
                             />
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                             <select
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                value={editFormData.categoryId}
                                onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})}
                                required
                             >
                                <option value="">-- Chọn --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                             <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                value={editFormData.price}
                                onChange={e => setEditFormData({...editFormData, price: Number(e.target.value)})}
                                required
                             />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                             <select
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                value={editFormData.status}
                                onChange={e => setEditFormData({...editFormData, status: e.target.value as any})}
                             >
                                <option value="AVAILABLE">Đang bán</option>
                                <option value="SOLD_OUT">Hết hàng</option>
                                <option value="UNAVAILABLE">Ngừng kinh doanh</option>
                             </select>
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                                    checked={editFormData.isChefRecommended}
                                    onChange={e => setEditFormData({...editFormData, isChefRecommended: e.target.checked})}
                                />
                                <span className="text-sm font-medium text-gray-700">Món gợi ý (Chef's Choice)</span>
                            </label>
                        </div>

                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                             <textarea
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                rows={3}
                                value={editFormData.description}
                                onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                             />
                        </div>
                    </form>
                </section>
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
                <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button 
                    form="edit-form"
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                >
                    Lưu thay đổi
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddItem} className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 relative">
            <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
                ✕
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 mb-6">Thêm món ăn mới</h2>

            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
                 <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="VD: Phở bò đặc biệt"
                    required
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                     <input
                        type="number"
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="0"
                        required
                        value={newItem.price}
                        onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                     <select
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        required
                        onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}
                        value={newItem.categoryId}
                    >
                        <option value="">-- Chọn --</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                  </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                 <textarea
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Mô tả chi tiết món ăn..."
                    rows={3}
                    value={newItem.description || ''}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                 />
              </div>

              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                  checked={newItem.isChefRecommended}
                  onChange={e => setNewItem({ ...newItem, isChefRecommended: e.target.checked })}
                />
                <span className="font-medium text-gray-700">Đánh dấu là món ngon gợi ý (Chef's Choice)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                    Hủy bỏ
                </button>
              <button 
                type="submit" 
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm"
              >
                Tạo món mới
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}