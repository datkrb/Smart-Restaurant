import { useState, useEffect } from 'react';

// Sử dụng Generics <T> để hỗ trợ mọi kiểu dữ liệu (string, number...)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập timer để update giá trị sau khoảng delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Dọn dẹp timer nếu giá trị thay đổi trước khi hết thời gian delay
    // (Giúp tránh gọi API liên tục khi gõ phím)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}