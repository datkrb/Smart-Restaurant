import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axiosClient from '../../api/axiosClient';

interface Waiter {
  id: string;
  fullName: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  qrUrl: string;
  waiterId?: string;
  waiter?: Waiter;
}

export default function AdminTablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Table | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newTable, setNewTable] = useState({ name: '', capacity: 4, waiterId: '' });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => {
    fetchTables();
    fetchWaiters();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axiosClient.get('/admin/tables');
      setTables(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách bàn:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaiters = async () => {
    try {
      const res = await axiosClient.get('/v1/users');
      const staff = res.data.data.filter((u: any) => u.role === 'WAITER');
      setWaiters(staff);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên:", error);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/tables', {
        ...newTable,
        restaurantId: "37f51c2d-d366-4d01-9e66-1d1a17dbae3b",
        waiterId: newTable.waiterId || null
      });
      setIsAddModalOpen(false);
      setNewTable({ name: '', capacity: 4, waiterId: '' });
      fetchTables();
    } catch (err) {
      alert("Lỗi khi thêm bàn");
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    try {
      await axiosClient.put(`/admin/tables/${editingTable.id}`, {
        name: editingTable.name,
        capacity: editingTable.capacity,
        waiterId: editingTable.waiterId || null,
        isActive: editingTable.isActive
      });
      setIsEditModalOpen(false);
      fetchTables();
    } catch (err) {
      alert("Lỗi khi cập nhật bàn");
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Bàn & QR</h1>
          <p className="text-gray-500 text-sm">Quản lý sơ đồ bàn, QR và phân công phục vụ</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95"
        >
          + Thêm bàn mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-full flex justify-between items-start mb-6">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {table.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-gray-900 font-bold text-sm">Bàn {table.capacity} chỗ</span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div
                className="bg-white p-3 rounded-2xl border-2 border-gray-50 shadow-inner cursor-pointer hover:border-orange-200 transition-colors"
                onClick={() => setSelectedQR(table)}
              >
                <QRCodeSVG
                  value={table.qrUrl}
                  size={100}
                  level="H"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-1">{table.name}</h3>
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    👤
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Phục vụ:</p>
                    <p className="text-sm font-bold text-gray-700">{table.waiter?.fullName || 'Chưa phân công'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-auto pt-4 border-t border-gray-50">
              <button
                onClick={() => setSelectedQR(table)}
                className="flex-1 bg-orange-50 text-orange-600 py-3 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors"
              >
                Mã QR
              </button>
              <button
                onClick={() => {
                  setEditingTable(table);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL - THÊM BÀN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddTable} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6">Thêm bàn mới</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Tên bàn</label>
                <input
                  className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold"
                  placeholder="VD: Bàn 01"
                  required
                  value={newTable.name}
                  onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Sức chứa</label>
                <input
                  type="number"
                  className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold"
                  required
                  value={newTable.capacity}
                  onChange={e => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Phân công phục vụ</label>
                <select
                  className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold bg-white"
                  value={newTable.waiterId}
                  onChange={e => setNewTable({ ...newTable, waiterId: e.target.value })}
                >
                  <option value="">-- Chưa gán --</option>
                  {waiters.map(w => (
                    <option key={w.id} value={w.id}>{w.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Hủy</button>
              <button type="submit" className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100">Lưu bàn</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL - CHỈNH SỬA BÀN */}
      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdateTable} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6">Chỉnh sửa {editingTable.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Tên bàn</label>
                <input
                  className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold"
                  required
                  value={editingTable.name}
                  onChange={e => setEditingTable({ ...editingTable, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Sức chứa</label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold"
                    required
                    value={editingTable.capacity}
                    onChange={e => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Trạng thái</label>
                  <select
                    className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold bg-white"
                    value={editingTable.isActive ? 'true' : 'false'}
                    onChange={e => setEditingTable({ ...editingTable, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Tạm dừng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Phân công phục vụ</label>
                <select
                  className="w-full border-2 border-gray-100 p-3 rounded-2xl focus:border-orange-500 outline-none transition-colors font-bold bg-white"
                  value={editingTable.waiterId || ''}
                  onChange={e => setEditingTable({ ...editingTable, waiterId: e.target.value })}
                >
                  <option value="">-- Chưa gán --</option>
                  {waiters.map(w => (
                    <option key={w.id} value={w.id}>{w.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Hủy</button>
              <button type="submit" className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-gray-200">Cập nhật</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal xem QR phóng to */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full flex flex-col items-center shadow-2xl">
            <h2 className="text-3xl font-black mb-1">{selectedQR.name}</h2>
            <p className="text-gray-400 mb-8 font-medium">Quét để đặt món tại bàn</p>

            <div className="bg-white p-6 border-8 border-orange-500/10 rounded-[2rem] mb-8 shadow-inner">
              <QRCodeSVG
                id={`qr-${selectedQR.id}`}
                value={selectedQR.qrUrl}
                size={220}
                level="H"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const canvas = document.getElementById(`qr-${selectedQR.id}`) as any;
                  const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                  let downloadLink = document.createElement("a");
                  downloadLink.href = pngUrl;
                  downloadLink.download = `QR_${selectedQR.name}.png`;
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                }}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Tải xuống mã QR
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="w-full text-gray-400 py-2 font-bold text-sm"
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