import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { guestApi } from '../api/guestApi';
import { useSessionStore } from '../store/useSessionStore';

const EntryPoint = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const tableId = searchParams.get('tableId');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tableId) {
      guestApi.startSession(tableId)
        .then((res: any) => {
          // Lưu thông tin vào store và chuyển hướng sang menu
          setSession(tableId, res.id);
          navigate('/menu');
        })
        .catch((err) => {
          console.error(err);
          setError("Bàn không hợp lệ hoặc lỗi kết nối server.");
        });
    }
  }, [tableId, navigate, setSession]);

  if (!tableId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Lỗi: Không tìm thấy bàn</h1>
        <p className="mt-2 text-gray-600">Vui lòng quét mã QR tại bàn để tiếp tục.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {error ? (
        <p className="text-red-500 font-bold">{error}</p>
      ) : (
        <p className="animate-pulse">Đang xác thực thông tin bàn...</p>
      )}
    </div>
  );
};

export default EntryPoint;