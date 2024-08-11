import { useNavigate } from "react-router-dom";

const useEndGame = () => {
  const navigate = useNavigate();
  const gameRoomId = sessionStorage.getItem("gameRoomId");

  const removeSessionStorageList = [
    "gameRoomId",
    "remainingPlayTime",
    "isChief",
    "areaRadius",
    "targetId",
    "areaCenter",
    "startTime",
    "remainingTime",
    "gamePlayTime",
    "gameStatus",
    "isAlive",
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
