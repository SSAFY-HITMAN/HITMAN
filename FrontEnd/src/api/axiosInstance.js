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
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터
// - accessToken이 만료되어 토큰 재발급했다는 응답이 올 경우, refreshToken으로 재요청
axiosInstance.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      alert("인증이 만료되었습니다. 다시 로그인해 주세요.");
      window.location.href = "/login";
      return Promise.reject(error);
    } else if (error.response.status === 7000) {
      const newToken = error.response.headers["newToken"];
      if (newToken) {
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
