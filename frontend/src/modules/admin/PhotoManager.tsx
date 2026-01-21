import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ui } from '../../utils/swalHelper';
import { getPhotoUrl } from '../../utils/photoUrl';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

const MySwal = withReactContent(Swal);

export default function PhotoManager({ itemId, photos, onRefresh }: { itemId: string, photos: Photo[], onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append('photos', file));

    const loadId = toast.loading("Đang tải ảnh lên..."); // Hiện trạng thái chờ
    setUploading(true);

    try {
      await axiosClient.post(`/menu/menu-items/${itemId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Tải ảnh thành công!", { id: loadId, duration: 2000 });
      onRefresh();
    } catch (err) {
      toast.error("Lỗi khi tải ảnh", { id: loadId });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    const result = await ui.confirmDelete(
      "Xóa hình ảnh?", 
      "Ảnh này sẽ biến mất khỏi thực đơn của khách hàng."
    );

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/menu/photos/${photoId}`);
        ui.alertSuccess("Đã xóa ảnh!");
        onRefresh();
      } catch (err) {
        ui.alertError("Lỗi khi xóa ảnh");
      }
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await axiosClient.patch('/menu/photos/set-primary', { photoId, itemId });
      ui.alertSuccess("Đã cập nhật ảnh chính!");
      onRefresh();
    } catch (err) {
      ui.alertError("Không thể thay đổi ảnh chính");
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
      <h4 className="font-bold mb-3 text-sm">Hình ảnh (Multi-upload)</h4>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos?.map((photo: any) => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
            <img src={getPhotoUrl(photo.url)} alt="menu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
              <button
                onClick={() => handleSetPrimary(photo.id)}
                className="text-[10px] bg-white px-2 py-1 rounded font-bold cursor-pointer hover:bg-orange-50"
              >
                {photo.isPrimary ? 'Đang là ảnh chính' : 'Đặt làm chính'}
              </button>
              <button
                onClick={() => handleDelete(photo.id)}
                className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold cursor-pointer hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
            {photo.isPrimary && (
              <div className="absolute top-1 left-1 bg-orange-500 text-[8px] text-white px-1.5 py-0.5 rounded shadow-sm font-bold">
                CHÍNH
              </div>
            )}
          </div>
        ))}
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white hover:border-orange-500 transition-colors">
          <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
          <span className="text-xl text-gray-400 font-bold">{uploading ? '...' : '+'}</span>
        </label>
      </div>
    </div>
  );
}