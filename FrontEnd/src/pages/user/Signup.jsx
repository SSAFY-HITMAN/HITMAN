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
import GoBackButton from "@/components/GoBackButton";

import { BASE_URL } from "@/constants/baseURL";
import loginTitle from "@/assets/login-title.png";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null); // 초기값은 null로 설정

  const checkUsername = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/isDuplicate`, {
        type: "username",
        value: username,
      });
      if (response.status == 200) {
        setUsernameChecked(true);
        setError(""); // 성공하면 에러 초기화
        alert("사용 가능한 닉네임입니다.");
      } else {
        setUsernameChecked(false);
        setError("닉네임이 이미 사용 중입니다.");
      }
    } catch (err) {
      console.error(err);
      setError("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const checkEmail = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/isDuplicate`, {
        type: "email",
        value: email,
      });
      if (response.status == 200) {
        setEmailChecked(true);
        setError(""); // 성공하면 에러 초기화
        alert("사용 가능한 이메일입니다.");
      } else {
        setEmailChecked(false);
        setError("이메일이 이미 사용 중입니다.");
      }
    } catch (err) {
      console.error(err);
      setError("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = e => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordMatch(newPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = e => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(password === newConfirmPassword);
  };

  // 이메일 유효성 검사
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 닉네임 유효성 검사 (특수기호 불허)
  const isValidUsername = username => {
    const usernameRegex = /^[a-zA-Z0-9가-힣]+$/; // 특수기호 제외
    return usernameRegex.test(username);
  };

  const handleSignup = async () => {
    if (!isValidUsername(username)) {
      setError("닉네임에 특수기호를 사용할 수 없습니다.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        username,
        email,
        password,
      });

      if (response.status === 200) {
        setIsDialogOpen(true);
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      setError(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <GoBackButton to="/login" />
      <img src={loginTitle} className="mb-12 w-96" />
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
          <div className="mb-2 text-red-500" style={{ minHeight: "1.25rem" }}>
            {username && !isValidUsername(username) && (
              <div>특수기호를 사용할 수 없습니다.</div>
            )}
          </div>
          <span
            onClick={checkUsername}
            className="mt-2 block cursor-pointer text-right text-sm text-blue-500 hover:text-blue-700"
          >
            닉네임 중복확인
          </span>
        </div>

        <div className="mb-4">
          <Input
            type="email"
            placeholder="이메일"
            className="w-full p-4"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setEmailChecked(false); // 입력이 변경되면 중복체크 상태 초기화
            }}
          />
          <div className="mb-2 text-red-500" style={{ minHeight: "1.25rem" }}>
            {email && !isValidEmail(email) && (
              <div>이메일 형식이 올바르지 않습니다.</div>
            )}
          </div>
          <span
            onClick={checkEmail}
            className="mt-2 block cursor-pointer text-right text-sm text-blue-500 hover:text-blue-700"
          >
            이메일 중복확인
          </span>
        </div>
        <Input
          type="password"
          placeholder="비밀번호"
          className="mb-8 p-4"
          value={password}
          onChange={handlePasswordChange}
        />

        <Input
          type="password"
          placeholder="비밀번호 확인"
          className="mb-0 p-4"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
        <div className="text-500 mb-8" style={{ minHeight: "1.25rem" }}>
          {passwordMatch === false && (
            <div style={{ color: "red" }}>비밀번호가 일치하지 않습니다.</div>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="mb-8 w-60 bg-gradient-to-r from-purple-600 to-teal-300 font-bold shadow-3d"
        onClick={handleSignup}
        disabled={
          !usernameChecked || !emailChecked || !passwordMatch || !isFormValid
        }
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
                className="mt-4 w-40 bg-gradient-to-r from-teal-300 to-blue-800 font-bold"
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
