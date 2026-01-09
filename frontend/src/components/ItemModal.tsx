import { useState, useEffect } from 'react';
import { MenuItem, ModifierOption } from '../types';
import { useCartStore } from '../store/useCartStore';

interface Props {
  item: MenuItem;
  relatedItems?: MenuItem[];
  onSelectRelated?: (item: MenuItem) => void;
  onClose: () => void;
}

export default function ItemModal({ item, relatedItems = [], onSelectRelated, onClose }: Props) {
  // Lưu các option đã chọn theo groupId
  const [selectedModifiers, setSelectedModifiers] = useState<{ [key: string]: ModifierOption[] }>({});
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore(state => state.addToCart);

  // Reset state when item changes (for related items navigation)
  useEffect(() => {
    setSelectedModifiers({});
    setQuantity(1);
  }, [item.id]);

  const handleOptionChange = (groupId: string, option: ModifierOption, isRequired: boolean) => {
    setSelectedModifiers(prev => {
      const currentOptions = prev[groupId] || [];
      // Logic: Nếu bắt buộc chọn 1 (Single Select)
      if (isRequired) {
        return { ...prev, [groupId]: [option] };
      }
      // Logic: Multi-select (Thêm hoặc bớt)
      const exists = currentOptions.find(o => o.id === option.id);
      if (exists) {
        return { ...prev, [groupId]: currentOptions.filter(o => o.id !== option.id) };
      }
      return { ...prev, [groupId]: [...currentOptions, option] };
    });
  };

  const handleConfirm = () => {
    // Kiểm tra các nhóm bắt buộc (Required) đã được chọn chưa
    for (const group of item.modifierGroups) {
      if (group.required && (!selectedModifiers[group.id] || selectedModifiers[group.id].length === 0)) {
        alert(`Vui lòng chọn ${group.name}`);
        return;
      }
    }
    addToCart(item, quantity, selectedModifiers);
    onClose();
  };

  const isAvailable = item.status === 'AVAILABLE';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-0 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">

        {/* Header Image & Close */}
        <div className="relative w-full h-48 bg-gray-100 flex-shrink-0">
          {item.photos && item.photos.length > 0 ? (
            <img
              src={item.photos.find(p => p.isPrimary)?.url || item.photos[0].url}
              className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-80' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 p-2 rounded-full backdrop-blur-sm text-gray-800 hover:bg-white"
          >
            ✕
          </button>

          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-lg transform -rotate-6 border-2 border-white shadow-lg">
                {item.status === 'SOLD_OUT' ? 'HẾT HÀNG' : 'TẠM NGƯNG'}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-gray-800 leading-tight">{item.name}</h2>
            <span className="text-xl font-bold text-orange-600 shrink-0 ml-4">{item.price.toLocaleString()}đ</span>
          </div>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{item.description}</p>

          {/* Options */}
          {isAvailable && item.modifierGroups.map(group => (
            <div key={group.id} className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {group.name} {group.required && <span className="text-red-500">*</span>}
              </h3>
              <div className="space-y-2">
                {group.options.map(opt => (
                  <label key={opt.id} className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all ${(selectedModifiers[group.id]?.find(o => o.id === opt.id))
                      ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${(selectedModifiers[group.id]?.find(o => o.id === opt.id))
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                        }`}>
                        {(selectedModifiers[group.id]?.find(o => o.id === opt.id)) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <input
                        type={group.required ? "radio" : "checkbox"}
                        name={group.id}
                        className="hidden"
                        checked={!!selectedModifiers[group.id]?.find(o => o.id === opt.id)}
                        onChange={() => handleOptionChange(group.id, opt, group.required)}
                      />
                      <span className="font-medium text-gray-700">{opt.name}</span>
                    </div>
                    {opt.priceDelta > 0 && (
                      <span className="text-gray-500 font-medium text-sm">+{opt.priceDelta.toLocaleString()}đ</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Related Items Section */}
          {relatedItems.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🍽️</span> Có thể bạn cũng thích
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedItems.map(r => (
                  <div
                    key={r.id}
                    onClick={() => onSelectRelated && onSelectRelated(r)}
                    className="flex flex-col gap-2 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <div className="aspect-video w-full bg-gray-200 rounded-md overflow-hidden relative">
                      {r.photos?.[0]?.url && <img src={r.photos[0].url} className="w-full h-full object-cover" />}
                      {r.status !== 'AVAILABLE' && (
                        <div className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center font-bold uppercase">
                          {r.status === 'SOLD_OUT' ? 'Hết' : 'Ngưng'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-800 line-clamp-1">{r.name}</div>
                      <div className="text-orange-600 font-bold text-xs">{r.price.toLocaleString()}đ</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 sticky bottom-0">
          {isAvailable ? (
            <div className="flex gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm font-bold text-gray-600 active:scale-90 transition-transform"
                >-</button>
                <span className="font-bold text-lg w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm font-bold text-green-600 active:scale-90 transition-transform"
                >+</button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Thêm</span>
                <span>•</span>
                <span>{(item.price * quantity).toLocaleString()}đ</span>
              </button>
            </div>
          ) : (
            <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-center cursor-not-allowed uppercase tracking-wide">
              {item.status === 'SOLD_OUT' ? 'Đã hết hàng' : 'Tạm ngưng phục vụ'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}