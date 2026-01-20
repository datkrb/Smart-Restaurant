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
import ModifierManager from '../../modules/admin/ModifierManager';
import MenuItemDetail from '../../modules/admin/MenuItemDetail';
import { Layers, Edit, Trash2, Plus, X, Search, Filter } from 'lucide-react';

const MySwal = withReactContent(Swal);

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModifiersItem, setEditingModifiersItem] = useState<MenuItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);

  const [newItem, setNewItem] = useState<CreateMenuItemRequest>({
    name: '',
    price: 0,
    description: '',
    categoryId: '',
    isChefRecommended: false,
    status: 'AVAILABLE'
  });

  const [editFormData, setEditFormData] = useState<Partial<CreateMenuItemRequest>>({});

  // Filters & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Debounce search
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const fetchData = async () => {
    try {
      const [menuRes, catsRes] = await Promise.all([
        menuApi.getMenuItems({
          page,
          limit,
          search: debouncedSearch,
          categoryId: selectedCategory || undefined,
          sortBy: sortBy
        }),
        categoryApi.getAllCategories()
      ]);

      if (menuRes && menuRes.menuItems) {
        setItems(menuRes.menuItems.data || []);
        if (menuRes.menuItems.meta) {
          setTotalPages(menuRes.menuItems.meta.totalPages);
        }
      }

      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, sortBy]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, selectedCategory, sortBy]);

  function useDebounce<T>(value: T, delay: number): [T] {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return [debouncedValue];
  }

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
      ui.alertSuccess("Item added successfully");
      fetchData();
    } catch (error) {
      ui.alertError("Failed to add item (Make sure category is selected)");
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await menuApi.updateMenuItem(editingItem.id, editFormData);
      setIsEditModalOpen(false);
      setEditingItem(null);
      ui.alertSuccess("Item updated successfully");
      fetchData();
    } catch (error) {
      ui.alertError("Failed to update item");
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const result = await ui.confirmDelete(
      "Delete item?",
      "The item will be hidden from the menu but will remain in report history."
    );

    if (result.isConfirmed) {
      try {
        await menuApi.deleteMenuItem(itemId);
        ui.alertSuccess("Item deleted successfully");
        fetchData();
      } catch (err) {
        ui.alertError("System error");
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
      status: item.status,
      prepTime: item.prepTime
    });
    setIsEditModalOpen(true);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage menu items, prices and images</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-white z-10 py-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_ASC">Price: Low to High</option>
            <option value="price_DESC">Price: High to Low</option>
            <option value="name_ASC">Name A-Z</option>
            <option value="name_DESC">Name Z-A</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100 mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold w-24">Image</th>
              <th className="p-4 font-semibold">Item Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold text-center">Topping / Size</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="p-3">
                  <div
                    title="Click to view details"
                    onClick={() => setViewingItem(item)}
                    className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center relative cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                  >
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
                  <div
                    title="Click to view details"
                    onClick={() => setViewingItem(item)}
                    className="font-medium text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                  >
                    {item.name}
                  </div>
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

                {/* MODIFIERS COLUMN */}
                <td className="p-4 text-center">
                  <button
                    onClick={() => setEditingModifiersItem(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors border border-purple-100"
                  >
                    <Layers size={14} />
                    {(item.modifierGroups?.length || 0) > 0 ? `${item.modifierGroups?.length} groups` : 'Add'}
                  </button>
                </td>

                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      item.status === 'SOLD_OUT' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {item.status === 'AVAILABLE' ? 'Available' :
                      item.status === 'SOLD_OUT' ? 'Sold Out' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <Edit size={16} /> <span className="hidden md:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={16} /> <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No items found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ITEM DETAIL MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Item Details</h2>
              <button onClick={() => setViewingItem(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto p-6">
              <MenuItemDetail item={viewingItem} />
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Edit Item</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"> <X size={20} /> </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8">
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Images</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                  <PhotoManager
                    itemId={editingItem.id}
                    photos={editingItem.photos || []}
                    onRefresh={fetchData}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Item Information</h3>
                <form id="edit-form" onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      value={editFormData.categoryId}
                      onChange={e => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">-- Select --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      value={editFormData.price}
                      onChange={e => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (mins)</label>
                     <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      value={editFormData.prepTime || 0}
                      onChange={e => setEditFormData({ ...editFormData, prepTime: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      value={editFormData.status}
                      onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="SOLD_OUT">Sold Out</option>
                      <option value="UNAVAILABLE">Hidden</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                        checked={editFormData.isChefRecommended}
                        onChange={e => setEditFormData({ ...editFormData, isChefRecommended: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">Chef's Choice</span>
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      rows={3}
                      value={editFormData.description}
                      onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
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
                Cancel
              </button>
              <button
                form="edit-form"
                type="submit"
                className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddItem} className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Item</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Special Beef Pho"
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="15"
                    min="0"
                    value={newItem.prepTime || ''}
                    onChange={e => setNewItem({ ...newItem, prepTime: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                    onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}
                    value={newItem.categoryId}
                  >
                    <option value="">-- Select --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Item details..."
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
                <span className="font-medium text-gray-700">Mark as Chef's Choice</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm"
              >
                Create Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODIFIERS MODAL */}
      {editingModifiersItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Topping / Options</h2>
                <p className="text-sm text-gray-500">For item: <span className="font-semibold text-gray-700">{editingModifiersItem.name}</span></p>
              </div>
              <button onClick={() => setEditingModifiersItem(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto p-6 bg-gray-50/50">
              <ModifierManager menuItemId={editingModifiersItem.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}