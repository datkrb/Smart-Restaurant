import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/apiv1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // You can add authorization headers or other custom headers here
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data, // Chỉ lấy data, bỏ qua wrapper của axios
  (error) => {
    // Nếu lỗi 401 (Unauthorized), có thể clear token và redirect về login tại đây
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // window.location.href = '/login'; // Cẩn thận loop vô hạn
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
