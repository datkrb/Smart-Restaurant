import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

export default function PhotoManager({ itemId, photos, onRefresh }: { itemId: string, photos: Photo[], onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const formData = new FormData();
    // Multi-upload: Gửi nhiều file cùng lúc
    Array.from(e.target.files).forEach(file => formData.append('photos', file));

    setUploading(true);
    try {
      await axiosClient.post(`/admin/menu-items/${itemId}/photos`, formData);
      onRefresh();
    } catch (err) {
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    // Logic: Set Primary và Safe Validation
    await axiosClient.patch('/admin/photos/set-primary', { photoId, itemId });
    onRefresh();
  };

  const handleDelete = async (photoId: string) => {
    // Tính năng Remove ảnh theo tiêu chí chấm điểm
    if (window.confirm("Xóa ảnh này?")) {
      await axiosClient.delete(`/admin/photos/${photoId}`);
      onRefresh();
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
      <h4 className="font-bold mb-3 text-sm">Hình ảnh (Multi-upload)</h4>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos?.map(photo => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
            <img src={photo.url} alt="menu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
              <button onClick={() => handleSetPrimary(photo.id)} className="text-[10px] bg-white px-2 py-1 rounded">
                {photo.isPrimary ? 'Đang là ảnh chính' : 'Đặt làm chính'}
              </button>
              <button onClick={() => handleDelete(photo.id)} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded">Xóa</button>
            </div>
            {photo.isPrimary && <div className="absolute top-1 left-1 bg-orange-500 text-[8px] text-white px-1 rounded">Chính</div>}
          </div>
        ))}
        <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100">
          <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
          <span className="text-xl text-gray-400">{uploading ? '...' : '+'}</span>
        </label>
      </div>
    </div>
  );
}