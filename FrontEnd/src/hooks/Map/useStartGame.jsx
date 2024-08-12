import { useState, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import useBullet from "@/hooks/Map/useBullet";
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
  const { getBullet } = useBullet();
  const [timeUntilStart, setTimeUntilStart] = useState(null);

  // 미션 및 아이템 목록 업데이트 함수
  const updateMissionAndItems = (missions, items) => {
    setMissionList(missions);
    setItemList(items);
  };

  // 게임 시작 시간 처리 함수 별도 분리
  const handleStartGameTime = newStartTime => {
    const startTimeValue =
      new Date(newStartTime).getTime() + 9 * 60 * 60 * 1000;
    sessionStorage.setItem("startTime", startTimeValue);

    const currentTime = new Date().getTime();
    const initialTimeUntilStart = startTimeValue - currentTime; // 게임 시작까지 남은 시간, ms 단위
    console.log(`startTime: ${startTimeValue}`);
    console.log(`currentTime: ${currentTime}`);
    console.log(`initialTimeUntilStart: ${initialTimeUntilStart}`);
    setTimeUntilStart(initialTimeUntilStart);

    // 대기 시간 동안 1초마다 남은 시간 계산
    if (initialTimeUntilStart > 0) {
      const intervalId = setInterval(() => {
        const updatedTimeUntilStart = startTimeValue - new Date().getTime();

        // 대기 시간이 끝났다면
        if (updatedTimeUntilStart <= 0) {
          clearInterval(intervalId);
          setTimeUntilStart(0);
          setGameStatus(true);
          setIsAlive(true);
          sessionStorage.setItem("gameStatus", true);
          sessionStorage.setItem("isAlive", true);
        } else {
          setTimeUntilStart(updatedTimeUntilStart);
        }
      }, 1000);

      // 컴포넌트 unmount 시 interval 정리
      return () => clearInterval(intervalId);
    } else {
      setGameStatus(true); // 이미 시작 시간이 지났다면 즉시 시작
    }
  };

  const fetch = async () => {
    console.log("fetch 함수 호출됨");
    try {
      const response = await axiosInstance.get(`/in-game/init/${gameRoomId}`);
      console.log(`response.status: ${response.status}`);

      if (response.status == 200) {
        console.log("데이터 정상 수신");
        const metadata = response.data;
        console.log(`metadata: ${JSON.stringify(metadata)}`);

        // 반경, 중심, 타겟 닉네임 수신
        const newAreaRadius = parseInt(metadata.gameInfo.mapSize, 10);
        const newAreaCenter = {
          lat: parseFloat(metadata.gameInfo.centerLat).toFixed(5),
          lng: parseFloat(metadata.gameInfo.centerLng).toFixed(5),
        };
        const newTargetId = metadata.targetName;
        const newGamePlayTime = parseInt(metadata.gameInfo.time, 10) * 60; // 초 단위
        const newBullet = parseInt(metadata.bullets, 10);

        console.log(`newGamePlayTime: ${newGamePlayTime}`);
        console.log(`newBullet: ${newBullet}`);

        // 상태 업데이트
        setAreaRadius(newAreaRadius);
        setAreaCenter(newAreaCenter);
        setTargetId(newTargetId);
        getBullet(newBullet);

        sessionStorage.setItem("areaRadius", newAreaRadius);
        sessionStorage.setItem("areaCenter", newAreaCenter);
        sessionStorage.setItem("targetId", newTargetId);
        sessionStorage.setItem("gamePlayTime", newGamePlayTime);
        sessionStorage.setItem("bullets", newBullet);

        // 미션 및 아이템 업데이트
        updateMissionAndItems(metadata.myMissions, metadata.myItems);

        // 게임 시작 시간 처리
        handleStartGameTime(metadata.gameInfo.startTime);
      } else {
        alert(`요청 수신 중 문제가 발생했습니다: ${response.status}`);
      }
    } catch (error) {
      alert("요청을 보내는 중 문제가 발생했습니다.");
      console.log(error);
    }
  };

  return { fetch, timeUntilStart };
};

export default useStartGame;
