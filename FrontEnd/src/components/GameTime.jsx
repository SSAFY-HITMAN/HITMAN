import React, { useState, useEffect, useRef } from "react";

const SESSION_STORAGE_KEYS = {
  GAME_PLAY_TIME: "gamePlayTime",
  START_TIME: "startTime",
  REMAINING_PLAY_TIME: "remainingPlayTime",
};

const GameTime = () => {
  // 초기화
  const gamePlayTime =
    parseInt(sessionStorage.getItem(SESSION_STORAGE_KEYS.GAME_PLAY_TIME), 10) *
      60 || 0; // 초 단위로 환산
  const startTime = sessionStorage.getItem(SESSION_STORAGE_KEYS.START_TIME);

  // 남은 시간 초기화
  const initializeRemainingPlayTime = () => {
    const storedRemainingTime = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.REMAINING_PLAY_TIME
    );
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
  const updateTimer = () => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedTime = Math.floor((now - start) / 1000); // 경과 시간
    const newRemainingPlayTime = gamePlayTime - elapsedTime; // 남은 시간

    if (newRemainingPlayTime <= 0) {  // 남은 시간이 0이 되면 타이머 정지하고 남은 시간을 0으로 설정
      clearInterval(intervalIdRef.current);
      if (remainingPlayTime !== 0) {
        setRemainingPlayTime(0);
        sessionStorage.setItem(SESSION_STORAGE_KEYS.REMAINING_PLAY_TIME, "0");
      }
    } else {  // 남은 시간을 sessionStorage에 저장
      setRemainingPlayTime(newRemainingPlayTime);
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.REMAINING_PLAY_TIME,
        newRemainingPlayTime.toString()
      );
    }
  };

  useEffect(() => {
    if (!startTime) return; // 시작 시간이 없으면 타이머를 설정하지 않음

    updateTimer(); // 초기 타이머 업데이트

    intervalIdRef.current = setInterval(updateTimer, 1000); // 매초 타이머 업데이트

    return () => clearInterval(intervalIdRef.current); // 컴포넌트 unmount 시 interval 정리
  }, [gamePlayTime, startTime]);

  return (
    <div className="flex justify-center">
      <div className="relative w-full p-2">
        <div className="flex h-[8vh] w-[65vw] items-center justify-center rounded-lg border-2 border-black text-4xl font-bold">
          ⏱ {formatTime(remainingPlayTime)}
        </div>
      </div>
    </div>
  );
};

export default GameTime;
