import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import GoBackButton from "@/components/GoBackButton";

const RoomNumber = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");

  const handleEnterRoom = async () => {
    if (!gameCode) {
      setError("방 번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axiosInstance.get(`/gameroom/${gameCode}`);

      if (response.status == 200) {
        const { gameId } = response.data;
        navigate(`/room/${gameId}`);
      } else if (response.status === 400) {
        setError("인원이 다 차서 들어갈 수 없습니다");
      } else {
        setError("해당하는 방이 없습니다.");
      }
    } catch (err) {
      setError(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      <GoBackButton to="/home" />
      <h1 className="mb-4 text-3xl font-bold">방 코드 입력</h1>
      <p className="mb-12">방장이 알려주는 방 코드를 입력해 입장하세요.</p>
      <Input
        type="text"
        placeholder="Room Code"
        className="mb-4 w-60 p-4 text-black"
        value={gameCode}
        onChange={e => setGameCode(e.target.value)}
      />
      <Button
        type="submit"
        className="mb-8 w-20 bg-gradient-to-r from-teal-300 to-blue-800 font-bold"
        onClick={handleEnterRoom}
      >
        입장
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default RoomNumber;
