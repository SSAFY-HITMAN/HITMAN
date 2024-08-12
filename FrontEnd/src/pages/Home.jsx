import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/Button";

import GameSettingDialog from "@components/GameSettingDialog";

import titleImage from "@assets/app-title.png";
import plusIcon from "@assets/material-icon/plus-icon.svg";
import qrcodeIcon from "@assets/material-icon/qrcode-icon.svg";
import trophyIcon from "@assets/material-icon/trophy-icon.svg";
import profileIcon from "@assets/material-icon/profile-icon.svg";

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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="h-screen bg-theme-color-2">
      <div className="m-4 flex h-screen flex-col items-center justify-center">
        <img src={titleImage} alt="titleImage" className="w-60" />

        <div className="mb-4 font-bold">XXX 님 환영합니다.</div>
        <Button onClick={handleLogout} className="mb-12 bg-rose-600 font-bold">
          로그아웃
        </Button>

        <div className="grid grid-cols-2 gap-8">
          <ActionButton
            onClick={() => setDialogOpen(true)}
            icon={plusIcon}
            color="bg-amber-300"
            label="방 만들기"
          />
          <ActionButton
            onClick={() => navigate("/room-number")}
            icon={qrcodeIcon}
            color="bg-teal-300"
            label="방 코드 찍기"
          />
          <ActionButton
            onClick={() => navigate("/rank")}
            icon={trophyIcon}
            color="bg-rose-300"
            label="순위"
          />
          <ActionButton
            onClick={() => navigate("/profile")}
            icon={profileIcon}
            color="bg-indigo-300"
            label="내 정보"
          />
        </div>
        <GameSettingDialog
          isOpen={isDialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default Home;
