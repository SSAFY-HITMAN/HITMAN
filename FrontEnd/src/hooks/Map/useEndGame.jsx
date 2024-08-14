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

  const endGame = msg => {
    removeSessionStorageList.forEach(value => {
      sessionStorage.removeItem(value);
    });

    sessionStorage.setItem("winner1", msg.winner1);
    sessionStorage.setItem("winner2", msg.winner2);
    sessionStorage.setItem("result", JSON.stringify(msg.result));

    console.log(`winner1: ${sessionStorage.getItem("winner1")}`);
    console.log(`winner2: ${sessionStorage.getItem("winner2")}`);
    console.log(`result: ${JSON.parse(sessionStorage.getItem("result"))}`);

    navigate(`/ending/${gameRoomId}`);
  };

  return { endGame };
};

export default useEndGame;
