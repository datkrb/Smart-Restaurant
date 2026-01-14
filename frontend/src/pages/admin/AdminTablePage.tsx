import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { tableApi } from '../../api/tableApi';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../types';
import { ui } from '../../utils/swalHelper';

export default function AdminTablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Table | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const tableRes  = await tableApi.getTables();
        // Assuming user confirmed this structure: tableRes.data is { data: Table[] }
        // BUT user code was tableRes.data.data. 
        // If tableApi returns Promise<{ data: Table[] }> and axios unwraps, then tableRes = { data: [...] }.
        // So tableRes.data is the array.
        // User wrote tableRes.data.data. This implies tableRes is NOT unwrapped or has nested data.
        // I will trust the user's manual edit for now:
        const tables = (tableRes as any).data?.data || (tableRes as any).data || []; 
        // Safe check to avoid crash if they are wrong
        
        setTables(Array.isArray(tables) ? tables : []);

    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tableApi.createTable(newTable.name, newTable.capacity);
      setIsAddModalOpen(false);
      setNewTable({ name: '', capacity: 4 });
      ui.alertSuccess("Đã thêm bàn mới");
      fetchData();
    } catch (err) {
      ui.alertError("Lỗi thêm bàn");
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    try {
      await tableApi.updateTable(editingTable.id, {
        name: editingTable.name,
        capacity: editingTable.capacity,
        isActive: editingTable.isActive,
      });
      setIsEditModalOpen(false);
      ui.alertSuccess("Đã cập nhật thông tin bàn");
      fetchData();
    } catch (err) {
      ui.alertError("Lỗi cập nhật bàn");
    }
  };

  const handleDeleteTable = async (id: string) => {
      const confirm = await ui.confirmDelete("Xóa bàn này?", "Hành động này không thể hoàn tác.");
      if (confirm.isConfirmed) {
          try {
              await tableApi.deleteTable(id);
              ui.alertSuccess("Đã xóa bàn");
              fetchData();
          } catch (error) {
              ui.alertError("Lỗi xóa bàn");
          }
      }
  }

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Bàn & QR</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý sơ đồ bàn, QR code và trạng thái hoạt động</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <span>+ Thêm bàn mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all group relative overflow-hidden">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
               <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                   table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
               }`}>
                 {table.isActive ? 'Active' : 'Stopped'}
               </span>
            </div>

            <div className="flex flex-col items-center mb-6 mt-2">
                <div 
                    className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-gray-200 p-2 mb-4 group-hover:border-orange-200 transition-colors cursor-pointer"
                    onClick={() => setSelectedQR(table)}
                >
                    <QRCodeSVG
                        value={table.qrCodeUrl || `http://localhost:3000/table/${table.id}`} // Fallback URL
                        size={100}
                        className="w-full h-full"
                        level="M"
                    />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{table.name}</h3>
                <p className="text-gray-500 text-sm font-medium mt-1">Sức chứa: {table.capacity} người</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
               <button 
                  onClick={() => {
                      setEditingTable(table);
                      setIsEditModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
               >
                   Cấu hình
               </button>
               <button 
                  onClick={() => handleDeleteTable(table.id)}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
               >
                   Xóa
               </button>
            </div>
            
            <button 
                onClick={() => setSelectedQR(table)}
                className="w-full mt-3 px-3 py-2 rounded-lg bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 transition-colors"
            >
                Xem QR Lớn
            </button>
          </div>
        ))}
      </div>
      
      {tables.length === 0 && (
          <div className="text-center py-16 text-gray-400">
              Chưa có bàn nào. Hãy thêm bàn mới.
          </div>
      )}

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddTable} className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Thêm bàn mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                <input
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="VD: Bàn 01"
                  required
                  value={newTable.name}
                  onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                  min={1}
                  value={newTable.capacity}
                  onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Hủy bỏ</button>
              <button type="submit" className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 shadow-sm">Thêm bàn</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT STATUS */}
      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form onSubmit={handleUpdateTable} className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cấu hình: {editingTable.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Hiện tại chỉ hỗ trợ cập nhật trạng thái hoạt động.</p>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                  <input
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={editingTable.name}
                    onChange={e => setEditingTable({ ...editingTable, name: e.target.value })}
                    required
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={editingTable.capacity}
                    onChange={e => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                    required
                    min={1}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    value={editingTable.isActive ? 'true' : 'false'}
                    onChange={e => setEditingTable({ ...editingTable, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Đang hoạt động (Active)</option>
                    <option value="false">Tạm dừng (Stopped)</option>
                  </select>
               </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Hủy bỏ</button>
              <button type="submit" className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 shadow-sm">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL QR LARGE */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">{selectedQR.name}</h2>
            <p className="text-gray-500 mb-6 font-medium text-sm">Quét mã để đặt món</p>

            <div className="bg-white p-4 rounded-xl border-4 border-orange-100 mb-6">
              <QRCodeSVG
                id={`qr-${selectedQR.id}`}
                value={selectedQR.qrCodeUrl || `http://localhost:3000/table/${selectedQR.id}`}
                size={200}
                level="H"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const canvas = document.getElementById(`qr-${selectedQR.id}`) as any;
                  // Note: QRCodeSVG is SVG, to download as PNG requires canvas conversion which is complex 
                  // or using `qrcode.react` Canvas component. 
                  // For simplicity, we just print or let user scan.
                  // Or checking if `qrcode.react` exports a canvas we can grab. 
                  // Changing to SVG download for safety.
                  const svg = document.getElementById(`qr-${selectedQR.id}`);
                  if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `QR_${selectedQR.name}.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  }
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold shadow-sm hover:bg-orange-700 transition-colors"
              >
                Tải xuống (SVG)
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="w-full text-gray-500 py-2 font-medium hover:text-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}