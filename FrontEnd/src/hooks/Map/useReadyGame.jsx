import { useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance.js";

// Room.jsx에서 시작 프로세스 관리
const useReadyGame = () => {
  const { gameRoomId } = useContext(GameContext);

  const handleStartGame = async () => {
    if (!navigator.geolocation) {
      alert("위치 정보를 수집할 수 없습니다. 나중에 다시 시도해주세요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const posToStart = {
          centerLat: latitude.toFixed(5),
          centerLng: longitude.toFixed(5),
        };

        try {
          await axiosInstance.post(`/gameroom/${gameRoomId}/start`, posToStart);
        } catch (err) {
          alert(
            "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
          );
        }
      },
      error => alert(`위치 정보 수집 중 에러가 발생했습니다: ${error.message}`)
    );
  };

  // setIsLoading은 useRoomWebSocket.jsx에서 사용
  return { handleStartGame };
};

export default useReadyGame;
