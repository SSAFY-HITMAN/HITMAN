import { GameContext } from "@/context/GameContext";
import React, { useState, useEffect, useContext, useRef } from "react";

const GameTime = () => {
  const { gameStatus, setGameStatus, setIsAlive } = useContext(GameContext);

  // startTime과 gamePlayTime을 state로 관리
  const [startTime, setStartTime] = useState(null);
  const [gamePlayTime, setGamePlayTime] = useState(null);

  // 남은 시간 초기화
  const initializeRemainingPlayTime = () => {
    const storedRemainingTime = sessionStorage.getItem("remainingPlayTime");
    return storedRemainingTime
      ? parseInt(storedRemainingTime, 10)
      : gamePlayTime;
  };

  // 남은 시간 상태 관리
  const [remainingPlayTime, setRemainingPlayTime] = useState(
    initializeRemainingPlayTime
  );
  const intervalIdRef = useRef(null);

  // 화면에 표시하는 시간 포맷 함수
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 타이머 업데이트 함수
  const updateTimer = startTime => {
    if (!startTime) return;

    const start = startTime;
    const now = Date.now();
    const elapsedTime = Math.floor((now - start) / 1000); // 경과 시간
    const newRemainingPlayTime = gamePlayTime - elapsedTime; // 남은 시간

    // console.log(`start: ${start}, ${typeof start}`);
    // console.log(`GameTime.jsx - updateTimer - start: ${start}`);
    // console.log(`GameTime.jsx - updateTimer - now: ${now}`);

    // 대기시간 1분 경과 시 gameStatus, isAlive 변경
    if (elapsedTime >= 60) {
      setGameStatus(true);
      setIsAlive(true);
      sessionStorage.setItem("gameStatus", true);
      sessionStorage.setItem("isAlive", true);
    }

    if (newRemainingPlayTime <= 0) {
      // 남은 시간이 0이 되면 타이머 정지하고 남은 시간을 0으로 설정
      clearInterval(intervalIdRef.current);
      if (remainingPlayTime !== 0) {
        setRemainingPlayTime(0);
        sessionStorage.setItem("remainingPlayTime", "0");
      }
    } else {
      // 남은 시간을 sessionStorage에 저장
      setRemainingPlayTime(newRemainingPlayTime);
      sessionStorage.setItem(
        "remainingPlayTime",
        newRemainingPlayTime.toString()
      );
    }
  };

  useEffect(() => {
    // startTime과 gamePlayTime이 없을 때 sessionStorage를 주기적으로 체크
    const checkSessionStorage = () => {
      const storedStartTime = sessionStorage.getItem("startTime");
      const storedGamePlayTime = parseInt(
        sessionStorage.getItem("gamePlayTime"),
        10
      );

      if (storedStartTime && storedGamePlayTime) {
        setStartTime(storedStartTime);
        setGamePlayTime(storedGamePlayTime);
      }
    };

    // 1초 간격으로 sessionStorage 확인
    const interval = setInterval(checkSessionStorage, 1000);

    // startTime과 gamePlayTime이 설정되면 타이머를 시작
    if (!gameStatus) {
      if (startTime && gamePlayTime) {
        clearInterval(interval); // interval 제거
        updateTimer(startTime); // 초기 타이머 업데이트

        intervalIdRef.current = setInterval(() => {
          updateTimer(startTime);
        }, 1000); // 매초 타이머 업데이트
      }
    } else {
      console.log("clearInterval: GameTime.jsx");
      clearInterval(interval);
      intervalIdRef.current = setInterval(() => {
        updateTimer(startTime);
      }, 1000); // 매초 타이머 업데이트
    }

    return () => {
      clearInterval(interval); // 컴포넌트 unmount 시 interval 정리
      clearInterval(intervalIdRef.current); // 기존 타이머 정리
    };
  }, [gameStatus, startTime, gamePlayTime]);

  return (
    <div className="m-4 flex h-16 w-48 items-center justify-center rounded-lg border-2 border-black bg-white text-4xl font-bold text-black">
      ⏱ {formatTime(remainingPlayTime)}
    </div>
  );
};

export default GameTime;
