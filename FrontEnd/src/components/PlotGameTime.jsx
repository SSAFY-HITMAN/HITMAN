import React, { useState, useEffect, useRef } from "react";

const PlotGameTime = () => {
  const gamePlayTime =
    parseInt(sessionStorage.getItem("gamePlayTime"), 10) * 60 || 0; // 초 단위로 환산
  const startTime = sessionStorage.getItem("startTime");

  const initializeRemainingPlayTime = () => {
    const storedRemainingTime = sessionStorage.getItem("remainingPlayTime");
    return storedRemainingTime
      ? parseInt(storedRemainingTime, 10)
      : gamePlayTime;
  };
  const [remainingPlayTime, setRemainingPlayTime] = useState(
    initializeRemainingPlayTime
  );
  const intervalIdRef = useRef(null);

  // 화면에 표시하는 부분으로 return하는 함수
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (!startTime) return; // 시작 시간이 없으면 타이머를 설정하지 않음

    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsedTime = Math.floor((now - start) / 1000);
      const newRemainingPlayTime = gamePlayTime - elapsedTime; // 초 단위로 연산

      if (newRemainingPlayTime <= 0) {
        clearInterval(intervalIdRef.current); // 남은 시간이 0이 되면 타이머 정지
        if (remainingPlayTime !== 0) {
          setRemainingPlayTime(0);
          sessionStorage.setItem("remainingPlayTime", "0");
        }
      } else {
        setRemainingPlayTime(newRemainingPlayTime);
        sessionStorage.setItem(
          "remainingPlayTime",
          newRemainingPlayTime.toString()
        );
      }
    };

    updateTimer(); // 초기 타이머 업데이트

    intervalIdRef.current = setInterval(updateTimer, 1000); // 매초 타이머 업데이트

    return () => clearInterval(intervalIdRef.current); // 컴포넌트 언마운트 시 인터벌 정리
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

export default PlotGameTime;
