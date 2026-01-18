import axios from "axios"

// initial instance axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// interceptors
// automatically attach token to request header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// interceptors response
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Gọi API refresh token (dùng axios gốc để tránh loop vô hạn nếu config sai)
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken } = response.data;

          // Lưu token mới
          localStorage.setItem("accessToken", accessToken);

          // Cập nhật header cho request hiện tại và các request sau
          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          // Thực hiện lại request ban đầu
          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Nếu refresh fail (hết hạn hoặc invalid), logout
          console.error("Session expired:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } else {
        // Không có refresh token thì logout luôn
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // window.location.href = "/login"; // Optional redirect
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient

