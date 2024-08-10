import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance.js";

import { Button } from "@components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";

const DropdownRadio = ({
  children,
  options,
  selectedValue,
  setSelectedValue,
}) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{children}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={selectedValue}
            onValueChange={setSelectedValue}
          >
            {options.map((option, index) => (
              <DropdownMenuRadioItem key={index} value={option}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="mt-2 text-center">{selectedValue}</p>
    </div>
  );
};

const GameSettingDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [selectedMaxPlayer, setSelectedMaxPlayer] = useState("👪");
  const [selectedGameTime, setSelectedGameTime] = useState("⏱");
  const [selectedMapSize, setSelectedMapSize] = useState("🗺");
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    // 설정에 대한 유효성 검사
    if (!roomName) {
      setError("방의 이름을 입력해주세요.");
      return;
    }
    if (selectedMaxPlayer === "👪") {
      setError("방의 최대 정원을 선택해주세요.");
      return;
    }
    if (selectedGameTime === "⏱") {
      setError("게임 시간을 선택해주세요.");
      return;
    }
    if (selectedMapSize === "🗺") {
      setError("맵의 반경을 선택해주세요.");
      return;
    }

    const maxPlayer = parseInt(selectedMaxPlayer.split(" ")[0]);
    const gameTime = parseInt(selectedGameTime.split(" ")[0]);
    const mapSize = parseInt(selectedMapSize.split(" ")[0]);

    try {
      const response = await axiosInstance.post("/gameroom/create", {
        name: roomName,
        maxPlayer,
        gameTime,
        mapSize,
      });

      if (response.status == 200) {
        sessionStorage.setItem("isChief", "true"); // 게임 시작한 사람 = 방장

        const { gameRoomId, qrCode, gameCode } = response.data;
        navigate(`/room/${gameRoomId}`, { state: { qrCode, gameCode } });
      } else {
        alert("방 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      alert(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle className="mb-2">게임 설정</DialogTitle>
          <DialogDescription className="leading-relaxed">
            게임 영역의 기준점은 &quot;방장의 현재 위치&quot;입니다. <br />
            기준점으로부터 설정한 반경만큼의 원 모양으로 <br />
            게임 영역이 생성됩니다.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right font-bold">
            방 이름
          </Label>
          <Input
            id="room-name"
            className="col-span-3"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
        </div>
        <div className="mb-4 flex justify-between">
          <DropdownRadio
            options={[
              "4 명",
              "5 명",
              "6 명",
              "7 명",
              "8 명",
              "1 명 (테스트용)",
              "2 명 (테스트용)",
            ]}
            selectedValue={selectedMaxPlayer}
            setSelectedValue={setSelectedMaxPlayer}
          >
            정원 ▼
          </DropdownRadio>
          <DropdownRadio
            options={[
              "10 분",
              "15 분",
              "20 분",
              "25 분",
              "30 분",
              "3 분 (테스트용)",
            ]}
            selectedValue={selectedGameTime}
            setSelectedValue={setSelectedGameTime}
          >
            시간 ▼
          </DropdownRadio>
          <DropdownRadio
            options={["100 m", "150 m", "200 m", "250 m", "300 m"]}
            selectedValue={selectedMapSize}
            setSelectedValue={setSelectedMapSize}
          >
            맵 사이즈 (반경) ▼
          </DropdownRadio>
        </div>

        <DialogFooter>
          <div className="flex justify-center gap-12">
            <Button
              onClick={handleCreateRoom}
              className="shadow-3d w-40 bg-gradient-to-r from-teal-500 to-blue-500 font-bold"
            >
              방 만들기
            </Button>
          </div>
        </DialogFooter>
        {error && <div className="text-red-500">{error}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingDialog;
