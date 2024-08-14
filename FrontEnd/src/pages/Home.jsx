import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import QrScanner from "react-qr-scanner";
import axiosInstance from "@/api/axiosInstance";

import { Button } from "@components/ui/Button";
import GameSettingDialog from "@components/GameSettingDialog";

import titleImage from "@assets/app-title.png";
import plusIcon from "@assets/material-icon/plus-icon.svg";
// import qrcodeIcon from "@assets/material-icon/qrcode-icon.svg";
import enterIcon from "@assets/material-icon/enter-icon.svg";
import trophyIcon from "@assets/material-icon/trophy-icon.svg";
import profileIcon from "@assets/material-icon/profile-icon.svg";
import MyProfileDialog from "@/components/MyProfileDialog";

const ActionButton = ({ onClick, icon, color, label }) => {
  return (
    <div className="flex flex-col items-center">
      <Button
        className={`mb-2 h-16 w-16 border-2 border-black ${color} font-bold text-black`}
        onClick={onClick}
      >
        <img src={icon} alt={label} className="w-40" />
      </Button>
      <span className="font-bold">{label}</span>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isGameSettingDialogOpen, setIsGameSettingDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  // const [isQrReaderOpen, setIsQrReaderOpen] = useState(false);

  const username = localStorage.getItem("username");

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 쿠키 삭제

    // 카카오 로그아웃
    window.Kakao.Auth.logout()
      .then(function (response) {
        console.log(Kakao.Auth.getAccessToken()); // null
      })
      .catch(function (error) {
        console.log("카카오로 로그인한 사용자가 아닙니다.");
      });
    navigate("/login");
  };

  // const handleQrScan = async data => {
  //   if (data) {
  //     const gameCode = data.text;
  //     console.log("QR Code Data:", gameCode);
  //     setIsQrReaderOpen(false);

  //     try {
  //       const response = await axiosInstance.get(`/gameroom/${gameCode}`);

  //       if (response.status == 200) {
  //         const { gameId } = response.data;
  //         navigate(`/room/${gameId}`);
  //       } else if (response.status === 400) {
  //         alert("인원이 다 차서 들어갈 수 없습니다");
  //       } else {
  //         alert("해당하는 방이 없습니다.");
  //       }
  //     } catch (err) {
  //       alert(
  //         "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
  //       );
  //     }
  //   }
  // };

  // const handleQrError = err => {
  //   console.error("QR Code Scan Error:", err);
  // };

  return (
    <div className="bg-theme-color-2 h-screen">
      <div className="flex h-screen flex-col items-center justify-center">
        <img
          src={titleImage}
          alt="titleImage"
          className="mb-8 w-80 animate-fade-in"
        />
        <div>
          <span className="mb-4 mr-4 font-bold">{username} 님 환영합니다.</span>
          <Button
            onClick={handleLogout}
            className="mb-20 bg-rose-500 font-bold shadow-3d"
          >
            로그아웃
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-10">
          <ActionButton
            onClick={() => setIsGameSettingDialogOpen(true)}
            icon={plusIcon}
            color="bg-gradient-to-r from-amber-300 to-amber-600"
            label="방 만들기"
          />
          <ActionButton
            // onClick={() => setIsQrReaderOpen(true)}
            onClick={() => navigate("/room-number")}
            icon={enterIcon}
            color="bg-gradient-to-r from-teal-300 to-teal-600"
            label="방 입장"
          />
          <ActionButton
            onClick={() => navigate("/rank")}
            icon={trophyIcon}
            color="bg-gradient-to-r from-rose-200 to-rose-400"
            label="순위"
          />
          <ActionButton
            onClick={() => setIsProfileDialogOpen(true)}
            icon={profileIcon}
            color="bg-gradient-to-r from-indigo-300 to-indigo-600"
            label="내 정보"
          />
        </div>

        <GameSettingDialog
          isOpen={isGameSettingDialogOpen}
          onClose={() => setIsGameSettingDialogOpen(false)}
        />
        <MyProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
        />

        {/* QR 미사용 */}
        {/* {isQrReaderOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="mb-4 text-4xl font-bold text-white">
                QR 코드 스캔
              </div>
              <div
                onClick={() => navigate("/room-number")}
                className="mb-16 font-bold text-white"
              >
                스캔이 안되시나요?{" "}
                <span className="text-rose-500">방 코드 입력하기</span>
              </div>
              <QrScanner
                className="mb-8 w-60 rounded-lg ring-4 ring-yellow-300"
                delay={300}
                onError={handleQrError}
                onScan={handleQrScan}
              />
              <Button
                onClick={() => setIsQrReaderOpen(false)}
                className="mb-8 w-20 bg-rose-500 font-bold shadow-3d"
              >
                닫기
              </Button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Home;
