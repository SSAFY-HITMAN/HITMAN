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
  const [usernameChecked, setUsernameChecked] = useState(false);

  const email = localStorage.getItem("email");

  const handleSignup = async () => {
    if (!isValidUsername(username)) {
      setError("닉네임에 특수기호를 사용할 수 없습니다.");
      return;
    }
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

  // 닉네임 유효성 검사 (특수기호 불허)
  const isValidUsername = username => {
    const usernameRegex = /^[a-zA-Z0-9가-힣]+$/; // 특수기호 제외
    return usernameRegex.test(username);
  };

  const checkUsername = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/isDuplicate`, {
        type: "username",
        value: username,
      });
      if (response.status === 200) {
        setUsernameChecked(true); // 중복확인이 성공하면 상태를 true로 설정
        setError("");
      } else {
        setUsernameChecked(false);
        setError("닉네임이 이미 사용 중입니다.");
      }
    } catch (err) {
      console.error(err);
      setError("닉네임 중복 확인 중 오류가 발생했습니다.");
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
        <div className="mb-4">
          <Input
            type="text"
            placeholder="닉네임"
            className="w-full p-4"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              setUsernameChecked(false); // 입력이 변경되면 중복체크 상태 초기화
            }}
          />
          {username && !isValidUsername(username) && (
            <div className="mb-4 text-red-500">
              닉네임에 특수기호를 사용할 수 없습니다.
            </div>
          )}
          <span
            onClick={checkUsername}
            className="mt-2 block cursor-pointer text-right text-sm text-blue-500 hover:text-blue-700"
          >
            닉네임 중복확인
          </span>
        </div>
      </div>
      <Button
        type="submit"
        className="mb-8 w-60 bg-gradient-to-r from-purple-600 to-teal-300 font-bold shadow-3d"
        onClick={handleSignup}
        disabled={!usernameChecked}
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
