const useEndGame = () => {
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
  removeSessionStorageList.forEach(value => {
    sessionStorage.removeItem(value);
  });
};

export default useEndGame;
