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

const SetUsername = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const email = localStorage.getItem("email");

  const handleSignup = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/social-signup`, {
        username,
        email,
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
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">닉네임 설정</h1>
      <p className="mb-12 text-center leading-loose opacity-80">
        소셜 로그인이 완료되었습니다.
        <br />
        닉네임만 설정하면 회원가입이 완료됩니다.
      </p>
      <div className="w-60 text-black">
        <Input
          type="text"
          placeholder="닉네임"
          className="mb-4 p-4"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="mb-8 w-60 bg-gradient-to-r from-purple-600 to-teal-300 font-bold shadow-3d"
        onClick={handleSignup}
      >
        회원가입
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원가입이 완료되었습니다.</DialogTitle>
            <DialogDescription>
              <Button
                onClick={() => navigate("/login")}
                className="bg-theme-color-1 mt-4 w-40 font-bold"
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

export default SetUsername;
