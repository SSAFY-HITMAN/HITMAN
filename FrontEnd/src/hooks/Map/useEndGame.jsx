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
    "countPlayer",
    "bullets",
    "effectStartTime",
    "effectExpirationTime",
    "itemInEffect",
  ];

  const endGame = data => {
    removeSessionStorageList.forEach(value => {
      console.log(`sessionStorage.removeItem: ${value}`);
      sessionStorage.removeItem(value);
    });

    sessionStorage.setItem("winner1", data.winner1);
    sessionStorage.setItem("winner2", data.winner2);
    sessionStorage.setItem("result", JSON.stringfy(data.result));

    navigate(`/ending/${gameRoomId}`);
  };

  return { endGame };
};

export default useEndGame;
