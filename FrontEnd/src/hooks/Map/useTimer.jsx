import { useState, useEffect, useCallback, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance.js";

const INITIAL_SAFETY_TIME = 60; // 영역 이탈 가능 시간 60초 초기 세팅 (sessionStorage 값과 비교해 사용)

const useTimer = () => {
  const { gameRoomId, setIsAlive, username } = useContext(GameContext);
  const [remainingTime, setRemainingTime] = useState(() => {
    const savedRemainingTime = sessionStorage.getItem("remainingTime");
    return savedRemainingTime !== null
      ? parseInt(savedRemainingTime, 10)
      : INITIAL_SAFETY_TIME; // sessionStorage에 시간 정보가 있으면 사용
  });

  const decreaseTime = useCallback(() => {
    setRemainingTime(prevRemainingTime => prevRemainingTime - 1);
  }, []);

  useEffect(() => {
    if (remainingTime == 0) {
      // 타이머 종료로 인한 사망 처리
      (async () => {
        try {
          await axiosInstance.patch(`/in-game/eliminate`, {
            username: username,
            gameId: gameRoomId,
          });

          setIsAlive(false);
          sessionStorage.setItem("isAlive", false);
          console.log(`Timeout: Play ${username}`);
        } catch {
          // axios 요청 실패 시 부분 입력
          console.error("Failed to send death status");
        }
      })();
    }

    sessionStorage.setItem("remainingTime", remainingTime);
  }, [remainingTime, gameRoomId, username, setIsAlive]);

  return { remainingTime, decreaseTime };
};

export default useTimer;
