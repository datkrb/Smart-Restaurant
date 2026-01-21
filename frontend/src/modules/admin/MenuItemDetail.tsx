import React from 'react';
import { MenuItem } from '../../types';
import { X, Tag, Info, ChefHat, DollarSign, Layers } from 'lucide-react';
import { getPhotoUrl } from '../../utils/photoUrl';

interface MenuItemDetailProps {
  item: MenuItem;
}

export default function MenuItemDetail({ item }: MenuItemDetailProps) {
  const primaryPhoto = item.photos?.find(p => p.isPrimary) || item.photos?.[0];
  const otherPhotos = item.photos?.filter(p => p.id !== primaryPhoto?.id) || [];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION: Image & Main Info */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Images */}
        <div className="w-full md:w-1/3 space-y-3">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {primaryPhoto ? (
                    <img 
                        src={getPhotoUrl(primaryPhoto.url)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
            </div>
            {otherPhotos.length > 0 && (
                <div className="flex gap-2 chat-scroll overflow-x-auto pb-2">
                    {otherPhotos.map(p => (
                        <div key={p.id} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                             <img src={getPhotoUrl(p.url)} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right: Info */}
        <div className="flex-1 space-y-4">
            <div>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        item.status === 'SOLD_OUT' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {item.status}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <h3 className="text-xl font-bold text-orange-600">
                       {item.price.toLocaleString()}đ
                   </h3>
                   {item.isChefRecommended && (
                       <span className="flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                           <ChefHat size={14}/> Chef's Choice
                       </span>
                   )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Tag size={16} className="text-gray-400"/>
                <span className="font-semibold">Category:</span>
                <span>{item.category?.name || "---"}</span>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Info size={16} className="text-gray-400"/>
                    Mô tả
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-6">
                    {item.description || "Không có mô tả chi tiết."}
                </p>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      {/* MODIFIERS SECTION */}
      <div>
         <div className="flex items-center gap-2 mb-4">
            <Layers size={20} className="text-purple-600"/>
            <h3 className="text-lg font-bold text-gray-800">Topping / Tùy chọn</h3>
         </div>
         
         {item.modifierGroups && item.modifierGroups.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {item.modifierGroups.map(group => (
                     <div key={group.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                         <div className="flex justify-between items-center mb-3">
                             <h4 className="font-bold text-gray-800">{group.name}</h4>
                             <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${group.required ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                 {group.required ? 'Required' : 'Optional'}
                             </span>
                         </div>
                         <div className="space-y-2">
                             {group.options.map(opt => (
                                 <div key={opt.id} className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 last:border-0">
                                     <span className="text-gray-600">{opt.name}</span>
                                     <span className="font-medium text-gray-900">+{opt.priceDelta.toLocaleString()}đ</span>
                                 </div>
                             ))}
                             {group.options.length === 0 && <span className="text-xs text-gray-400 italic">Trống</span>}
                         </div>
                     </div>
                 ))}
             </div>
         ) : (
             <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 text-sm">
                 Món này không có tùy chọn (Size/Topping) nào.
                 <br/>
                 <span className="text-xs opacity-70">Ấn vào nút "Thêm" ở cột Topping để cấu hình.</span>
             </div>
         )}
      </div>
    </div>
  );
}
