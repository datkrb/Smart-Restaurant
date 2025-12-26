import React, { useEffect, useState } from 'react';
import { guestApi } from '../api/guestApi';
import { Category, MenuItem } from '../types';
import ItemModal from '../components/ItemModal'; // Component chúng ta đã viết ở bước trước

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestApi.getMenu()
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải thực đơn...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24">
      <header className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Smart Restaurant</h1>
        <p className="text-sm text-gray-500">Vui lòng chọn món bạn yêu thích</p>
      </header>

      <div className="p-4 space-y-8">
        {categories.map(cat => (
          <section key={cat.id}>
            <h2 className="text-lg font-bold text-orange-600 mb-3 border-b pb-1">{cat.name}</h2>
            <div className="space-y-4">
              {cat.menuItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-3 rounded-xl shadow-sm flex gap-3 cursor-pointer active:scale-95 transition-transform"
                >
                  {/* Ảnh món ăn (nếu có) */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-orange-600 font-bold">{item.price.toLocaleString()}đ</span>
                      {item.isChefRecommended && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          Chef's Choice
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Modal chi tiết món & Modifiers */}
      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Nút Giỏ hàng nổi */}
      <button className="fixed bottom-6 left-4 right-4 bg-orange-600 text-white p-4 rounded-2xl shadow-xl font-bold flex justify-between items-center">
        <span>Xem giỏ hàng</span>
        <span className="bg-white/20 px-3 py-1 rounded-lg">0 món</span>
      </button>
    </div>
  );
}