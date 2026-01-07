import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';

const MySwal = withReactContent(Swal);

// Màu sắc chủ đạo của dự án
const COLORS = {
  primary: '#ea580c', // orange-600
  danger: '#dc2626',  // red-600
  secondary: '#94a3b8' // slate-400
};

export const ui = {
  /**
   * Hộp thoại xác nhận xóa hoặc hành động nguy hiểm
   */
  confirmDelete: async (title: string, text: string) => {
    return MySwal.fire({
      title: React.createElement('span', { className: 'text-xl font-bold' }, title),
      html: React.createElement('span', { className: 'text-sm text-gray-600' }, text),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: COLORS.danger,
      cancelButtonColor: COLORS.secondary,
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy bỏ',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
      }
    });
  },

  /**
   * Hộp thoại xác nhận chung (màu cam thương hiệu)
   */
  confirmAction: async (title: string, text: string) => {
    return MySwal.fire({
      title: React.createElement('span', { className: 'text-xl font-bold' }, title),
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: COLORS.primary,
      cancelButtonColor: COLORS.secondary,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại',
      customClass: { popup: 'rounded-3xl' }
    });
  },

  /**
   * Thông báo nhanh (Toast)
   */
  alertSuccess: (msg: string) => toast.success(msg, { duration: 2000 }),
  alertError: (msg: string) => toast.error(msg, { duration: 3000 }),
  loading: (msg: string) => toast.loading(msg)
};