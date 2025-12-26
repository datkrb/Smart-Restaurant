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
    addToCart(item, 1, selectedModifiers);
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

        <button 
          onClick={handleConfirm}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
        >
          Thêm vào giỏ hàng
        </button>
        <button onClick={onClose} className="w-full mt-2 text-gray-500 py-2">Hủy bỏ</button>
      </div>
    </div>
  );
}