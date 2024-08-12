import axios from "axios";
import { BASE_URL } from "@/constants/baseURL";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// 요청 인터셉터
// - 인증이 필요한 모든 요청의 헤더에 토큰을 담아 전송
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers["RefreshToken"] = `Bearer ${refreshToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
// - accessToken이 만료되어 토큰 재발급했다는 응답이 올 경우, refreshToken으로 재요청
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      error.response.data.errorCode === 7000
    ) {
      try {
        const response = await axiosInstance.post("/user/refresh-token", {
          refreshToken: localStorage.getItem("refreshToken"),
        });
        const { newToken } = response.data;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (tokenRefreshError) {
        console.error("Token refresh failed:", tokenRefreshError);
        return Promise.reject(tokenRefreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
