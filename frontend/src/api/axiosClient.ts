import axios from "axios"

// initial instance axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
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
  error => {
    if(error.response.status === 401){
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      
    }
    return Promise.reject(error)
  }

)

export default axiosClient

