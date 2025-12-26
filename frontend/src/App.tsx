import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Routes, Route } from 'react-router-dom';
import { guestApi } from './api/guestApi';
import { useSessionStore } from './store/useSessionStore';
import MenuPage from './pages/MenuPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPoint />} />
      <Route path="/menu" element={<MenuPage />} />
      {/* Route dự phòng cho trang không tồn tại */}
      <Route path="*" element={<div className="p-10 text-center">Trang không tồn tại (404)</div>} />
    </Routes>
  );
}

function EntryPoint() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const tableId = searchParams.get('tableId');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tableId) {
      guestApi.startSession(tableId)
        .then((res) => {
          setSession(tableId, res.data.id);
          navigate('/menu');
        })
        .catch(err => {
          console.error(err);
          setError("Không thể khởi tạo phiên làm việc. Vui lòng kiểm tra lại mã QR hoặc Backend.");
        });
    }
  }, [tableId, navigate, setSession]);

  // Nếu không có tableId trên URL
  if (!tableId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Lỗi: Không tìm thấy bàn</h1>
        <p className="mt-2 text-gray-600">Vui lòng quét mã QR tại bàn để xem menu và đặt món.</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  }

  return <div className="flex items-center justify-center h-screen">Đang xác thực bàn...</div>;
}

export default App;