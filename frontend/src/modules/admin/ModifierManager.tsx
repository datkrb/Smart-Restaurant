import React, { useState, useEffect } from 'react';
import { ModifierGroup, ModifierOption } from '../../types';
import { menuApi } from '../../api/menuApi';
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronRight, Save } from 'lucide-react';

interface ModifierManagerProps {
    menuItemId: string;
}

export default function ModifierManager({ menuItemId }: ModifierManagerProps) {
    const [groups, setGroups] = useState<ModifierGroup[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch data
    const fetchModifiers = async () => {
        setLoading(true);
        try {
            const item = await menuApi.getMenuItemById(menuItemId);
            if (item && item.modifierGroups) {
                setGroups(item.modifierGroups);
            }
        } catch (error) {
            console.error("Error fetching modifiers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModifiers();
    }, [menuItemId]);

    // Add Group State
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupRequired, setNewGroupRequired] = useState(false);

    const handleAddGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await menuApi.createModifierGroup({
                menuItemId,
                name: newGroupName,
                required: newGroupRequired
            });
            setNewGroupName('');
            setNewGroupRequired(false);
            setIsAddingGroup(false);
            fetchModifiers();
        } catch (error) {
            alert("Lỗi thêm nhóm topping");
        }
    };

    // Add Option State (Tracked by group ID)
    const [addingOptionGroupId, setAddingOptionGroupId] = useState<string | null>(null);
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionPrice, setNewOptionPrice] = useState(0);

    const handleAddOption = async (e: React.FormEvent, groupId: string) => {
        e.preventDefault();
        try {
            await menuApi.createModifierOption({
                modifierGroupId: groupId,
                name: newOptionName,
                priceDelta: newOptionPrice
            });
            setNewOptionName('');
            setNewOptionPrice(0);
            setAddingOptionGroupId(null);
            fetchModifiers();
        } catch (error) {
            alert("Lỗi thêm tùy chọn");
        }
    };

    // Delete handlers
    const handleDeleteGroup = async (id: string) => {
        if (!window.confirm("Xóa nhóm này sẽ xóa tất cả tùy chọn bên trong. Tiếp tục?")) return;
        try {
            await menuApi.deleteModifierGroup(id);
            fetchModifiers();
        } catch (error) {
            alert("Lỗi xóa nhóm");
        }
    };

    const handleDeleteOption = async (id: string) => {
        if (!window.confirm("Xóa tùy chọn này?")) return;
        try {
            await menuApi.deleteModifierOption(id);
            fetchModifiers();
        } catch (error) {
            alert("Lỗi xóa tùy chọn");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-bold text-lg text-gray-800">Quản lý Topping / Size</h3>
                <button 
                    onClick={() => setIsAddingGroup(true)}
                    className="flex items-center gap-1 text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 font-medium"
                >
                    <Plus size={16} /> Thêm nhóm
                </button>
            </div>

            {/* ADD GROUP FORM */}
            {isAddingGroup && (
                <form onSubmit={handleAddGroup} className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-orange-800 mb-3">Thêm nhóm mới</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input 
                            placeholder="Tên nhóm (VD: Chọn Size, Topping thêm)"
                            className="border p-2 rounded-lg text-sm w-full outline-orange-500"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            required
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer">
                            <input 
                                type="checkbox"
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                checked={newGroupRequired}
                                onChange={e => setNewGroupRequired(e.target.checked)}
                            />
                            Bắt buộc chọn (Required)
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddingGroup(false)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-white rounded border border-transparent hover:border-gray-200">Hủy</button>
                        <button type="submit" className="px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700">Lưu</button>
                    </div>
                </form>
            )}

            {/* GROUPS LIST */}
            <div className="space-y-4">
                {groups.map(group => (
                    <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        {/* Group Header */}
                        <div className="bg-gray-50 p-4 flex justify-between items-center group/header">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded font-medium border ${group.required ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                    {group.required ? 'Bắt buộc' : 'Tùy chọn'}
                                </span>
                                <span className="font-bold text-gray-800">{group.name}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                <button 
                                    title="Xóa nhóm"
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="p-4 border-t border-gray-100">
                             {/* ADD OPTION FORM (Inline) */}
                            {addingOptionGroupId === group.id ? (
                                <form onSubmit={(e) => handleAddOption(e, group.id)} className="flex gap-2 mb-4 p-2 bg-blue-50/50 rounded-lg border border-blue-100 items-center">
                                    <input 
                                        placeholder="Tên (VD: Size L)" 
                                        className="flex-1 text-sm border p-1.5 rounded outline-blue-500"
                                        value={newOptionName}
                                        onChange={e => setNewOptionName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Giá thêm" 
                                        className="w-24 text-sm border p-1.5 rounded outline-blue-500"
                                        value={newOptionPrice}
                                        onChange={e => setNewOptionPrice(parseFloat(e.target.value))}
                                    />
                                    <button type="submit" className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"><Save size={14}/></button>
                                    <button type="button" onClick={() => setAddingOptionGroupId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><X size={14}/></button>
                                </form>
                            ) : (
                                <div className="mb-4">
                                    <button 
                                        onClick={() => setAddingOptionGroupId(group.id)}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded w-fit transition-colors"
                                    >
                                        <Plus size={12} /> Thêm tùy chọn
                                    </button>
                                </div>
                            )}

                            {group.options && group.options.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {group.options.map(option => (
                                        <div key={option.id} className="flex justify-between items-center p-2 rounded border border-gray-100 bg-white hover:border-gray-200 group/option">
                                            <span className="text-sm text-gray-700">{option.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-orange-600">+{option.priceDelta.toLocaleString()}đ</span>
                                                <button 
                                                    onClick={() => handleDeleteOption(option.id)}
                                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover/option:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Chưa có tùy chọn nào</p>
                            )}
                        </div>
                    </div>
                ))}

                {groups.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Chưa có nhóm Topping/Size nào
                    </div>
                )}
            </div>
        </div>
    );
}
