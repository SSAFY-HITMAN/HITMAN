import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { BASE_URL } from "@/constants/baseURL";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSignup = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        username,
        email,
        password,
      });

      if (response.status == 200) {
        setIsDialogOpen(true); // 회원가입에 성공했을 때만 다이얼로그를 보여주기
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      setError(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="m-4 flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 p-4 text-2xl font-bold">회원가입</h1>
      <div className="w-60">
        <Input
          type="text"
          placeholder="username"
          className="mb-4 p-4"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
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
        className="mb-8 bg-theme-color-2 font-bold text-cyan-600"
        onClick={handleSignup}
      >
        Sign Up &gt;
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원가입이 완료되었습니다.</DialogTitle>
            <DialogDescription>
              <Button
                onClick={() => navigate("/login")}
                className="mt-4 w-40 bg-theme-color-1 font-bold"
              >
                로그인 하러가기
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Signup;
