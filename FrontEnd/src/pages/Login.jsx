import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import { BASE_URL } from "@/constants/baseURL";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      setError(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="m-4 flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 p-4 text-2xl font-bold">로그인</h1>
      <div className="w-60">
        <Input
          type="email"
          placeholder="email"
          className="mb-4 p-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="password"
          className="mb-8 p-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="mb-8 bg-theme-color-1 font-bold"
        onClick={handleLogin}
      >
        Login &gt;
      </Button>
      {error && <div className="text-red-500">{error}</div>}
      <div className="cursor-pointer" onClick={() => navigate("/signup")}>
        계정이 없으신가요?{" "}
        <span className="font-bold text-rose-500">회원가입</span>
      </div>
    </div>
  );
};

export default Login;
