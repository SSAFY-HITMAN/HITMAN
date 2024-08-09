import { useNavigate } from "react-router-dom";

const useEndGame = () => {
  const navigate = useNavigate();
  const gameRoomId = sessionStorage.getItem("gameRoomId");

  const removeSessionStorageList = [
    "gameStatus",
    "isAlive",
    "gameRoomId",
    "areaCenter",
    "areaRadius",
    "targetId",
    "remainingTime",
    "startTime",
    "gamePlayTime",
    "remainingPlayTime",
  ];

  const endGame = () => {
    removeSessionStorageList.forEach(value => {
      sessionStorage.removeItem(value);
    });

    navigate(`/ending/${gameRoomId}`);
  };

  return { endGame };
};

export default useEndGame;
