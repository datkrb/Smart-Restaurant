import { useState } from 'react';
import { MenuItem, ModifierOption } from '../types';
import { useCartStore } from '../store/useCartStore';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: Props) {
  // Lưu các option đã chọn theo groupId
  const [selectedModifiers, setSelectedModifiers] = useState<{ [key: string]: ModifierOption[] }>({});
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore(state => state.addToCart);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{item.name}</h2>
        <p className="text-gray-500 mb-4">{item.description}</p>

        {/* Danh sách các nhóm tùy chọn (Size, Topping...) */}
        {item.modifierGroups.map(group => (
          <div key={group.id} className="mb-6">
            <h3 className="font-semibold mb-2">
              {group.name} {group.required && <span className="text-red-500">*</span>}
            </h3>
            <div className="space-y-2">
              {group.options.map(opt => (
                <label key={opt.id} className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <input
                      type={group.required ? "radio" : "checkbox"}
                      name={group.id}
                      checked={!!selectedModifiers[group.id]?.find(o => o.id === opt.id)}
                      onChange={() => handleOptionChange(group.id, opt, group.required)}
                    />
                    <span>{opt.name}</span>
                  </div>
                  <span className="text-gray-500">+{opt.priceDelta.toLocaleString()}đ</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <span className="font-semibold">Số lượng</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-xl font-bold w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 rounded-full border border-orange-200 flex items-center justify-center text-xl font-bold text-orange-600 hover:bg-orange-50"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 active:scale-95 transition-all"
        >
          Thêm vào giỏ hàng
        </button>
        <button onClick={onClose} className="w-full mt-2 text-gray-500 py-2 hover:text-gray-700">Hủy bỏ</button>
      </div>
    </div>
  );
}