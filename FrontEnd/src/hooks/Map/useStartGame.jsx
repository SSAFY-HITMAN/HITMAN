import { useState, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance";

// GamePlay.jsx에서 시작 프로세스 관리
const useStartGame = () => {
  const {
    setGameStatus,
    gameRoomId,
    setAreaRadius,
    setAreaCenter,
    setTargetId,
    setIsAlive,
    setMissionList,
    setItemList,
  } = useContext(GameContext);
  const [timeUntilStart, setTimeUntilStart] = useState(null);

  const fetch = async () => {
    try {
      const response = await axiosInstance.get(`/in-game/init/${gameRoomId}`);

      if (response.status == 200) {
        // 반경, 중심, 타겟 닉네임 수신
        const newAreaRadius = parseInt(response.gameInfo.mapSize, 10);
        const newAreaCenter = {
          lat: parseFloat(response.gameInfo.centerLat).toFixed(5),
          lng: parseFloat(response.gameInfo.centerLng).toFixed(5),
        };
        const newTargetId = response.targetName;

        // 상태 업데이트
        setAreaRadius(newAreaRadius);
        setAreaCenter(newAreaCenter);
        setTargetId(newTargetId);

        sessionStorage.setItem("areaRadius", newAreaRadius); // handleAlertDegree에서 별도 관리
        sessionStorage.setItem("areaCenter", newAreaCenter); // 게임 종료 시까지 불변
        sessionStorage.setItem("targetId", newTargetId); // "target" msgType에서 관리

        // 이하는 sessionStorage를 통해 PlotGameTime.jsx에서만 사용되는 부분
        const newGamePlayTime = parseInt(response.gameInfo.time, 10); // 분 단위
        const newStartTime = response.gameInfo.startTime;
        sessionStorage.setItem("gamePlayTime", newGamePlayTime.toString());
        sessionStorage.setItem("startTime", newStartTime);

        const newMissionList = response.myMissions;
        const newItemList = response.myItems;
        setMissionList(newMissionList);
        setItemList(newItemList);

        // 게임 시작 시간 처리
        const startTime = new Date(newStartTime).getTime();
        const currentTime = new Date().getTime();
        const initialTimeUntilStart = startTime - currentTime; // 게임 시작까지 남은 시간
        setTimeUntilStart(initialTimeUntilStart);

        if (initialTimeUntilStart > 0) {
          // 1초마다 남은 시간 계산
          const intervalId = setInterval(() => {
            const updatedTimeUntilStart = startTime - new Date().getTime();

            // 대기 시간이 끝났다면
            if (updatedTimeUntilStart <= 0) {
              clearInterval(intervalId);
              setTimeUntilStart(0);
              setGameStatus(true); // 대기 시간이 끝나면 게임 상태 변경
              setIsAlive(true);
            } else {
              setTimeUntilStart(updatedTimeUntilStart);
            }
          }, 1000);

          return () => clearInterval(intervalId);
        } else {
          setGameStatus(true); // 이미 시작 시간이 지났다면 즉시 시작
        }
      } else {
        alert(`요청 수신 중 문제가 발생했습니다: ${response.status}`);
      }
    } catch {
      alert("요청을 보내는 중 문제가 발생했습니다.");
    }
  };

  return { fetch, timeUntilStart };
};

export default useStartGame;
