import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import { BASE_URL } from "@/constants/baseURL";
import loginTitle from "@/assets/login-title.png";
import kaKaoLoginImg from "@/assets/kakao-login.png";
import googleLoginImg from "@/assets/google-login.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password,
      });

      if (response.status == 200) {
        const { accessToken, refreshToken, username, email } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);

        navigate("/home");
      } else {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      alert(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await axios.get(`${BASE_URL}/auth/kakao/getURL`).then(resp => {
        url = resp.data;
      });

      Kakao.Auth.authorize({
        redirectUri: url,
      });
    } catch (err) {
      alert(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await axios.get(`${BASE_URL}/auth/google/getURL`).then(resp => {
        url = resp.data;
      });

      window.location.href = url;
    } catch (err) {
      alert(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <img src={loginTitle} className="mb-12 w-96" />
      <div className="w-60 text-black">
        <Input
          type="email"
          placeholder="이메일"
          className="mb-4 p-4 caret-pink-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          className="mb-8 p-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="shadow-3d mb-8 w-60 bg-gradient-to-r from-teal-200 to-blue-800 font-bold"
        onClick={handleLogin}
      >
        로그인
      </Button>
      <div className="mb-12 cursor-pointer" onClick={() => navigate("/signup")}>
        계정이 없으신가요?{" "}
        <span className="font-bold text-rose-500">회원가입</span>
      </div>

      {/* 구분선 */}
      <div className="mb-12 flex w-full items-center">
        <div className="border-lightGray/30 flex-grow border-t"></div>
        <span className="mx-4 text-gray-400">또는</span>
        <div className="border-lightGray/30 flex-grow border-t"></div>
      </div>

      <img
        src={kaKaoLoginImg}
        alt="Kakao Login"
        className="mb-4 w-60"
        onClick={handleKakaoLogin}
      />
      <img
        src={googleLoginImg}
        alt="Google Login"
        className="mb-4 w-60"
        onClick={handleGoogleLogin}
      />
    </div>
  );
};

export default Login;
