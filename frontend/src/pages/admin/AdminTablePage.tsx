import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axiosClient from '../../api/axiosClient';

interface Table {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  qrUrl: string;
}

export default function AdminTablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axiosClient.get('/admin/tables');
      setTables(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy danh sách bàn:", error);
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // restaurantId: Lấy ID từ bản ghi Restaurant bạn đã Seed trong DB
      await axiosClient.post('/admin/tables', {
        ...newTable,
        restaurantId: "37f51c2d-d366-4d01-9e66-4d019e664d01"
      });
      setIsModalOpen(false);
      fetchTables(); // Tải lại danh sách sau khi thêm
    } catch (err) {
      alert("Lỗi khi thêm bàn");
    }
  };

  const downloadQR = (table: Table) => {
    const canvas = document.getElementById(`qr-${table.id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR_${table.name}.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu bàn...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bàn & QR</h1>
          <p className="text-gray-500">Quản lý sơ đồ bàn và mã QR đặt món</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
          + Thêm bàn mới
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleAddTable} className="bg-white p-8 rounded-2xl w-96">
              <h2 className="text-xl font-bold mb-4">Thêm bàn mới</h2>
              <div className="space-y-4">
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Tên bàn (VD: Bàn 10)"
                  required
                  onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                />
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Sức chứa"
                  required
                  onChange={e => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">Lưu</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">Hủy</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {table.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
              </span>
              <span className="text-gray-400 text-sm">Sức chứa: {table.capacity}</span>
            </div>

            <div
              className="bg-gray-50 p-4 rounded-xl mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedQR(table)}
            >
              <QRCodeSVG
                value={table.qrUrl}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1">{table.name}</h3>
            <p className="text-xs text-gray-400 mb-4 break-all text-center px-4">{table.qrUrl}</p>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setSelectedQR(table)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Xem QR
              </button>
              <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                Sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal xem QR phóng to */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">{selectedQR.name}</h2>
            <p className="text-gray-500 mb-6 text-center">Quét mã để truy cập menu và đặt món</p>

            <div className="bg-white p-4 border-4 border-orange-500 rounded-2xl mb-6">
              <QRCodeSVG
                id={`qr-${selectedQR.id}`}
                value={selectedQR.qrUrl}
                size={250}
                level="H"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => window.print()}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold"
              >
                In mã QR
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="w-full text-gray-400 py-2 font-medium"
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