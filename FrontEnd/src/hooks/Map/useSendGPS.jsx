import { useEffect, useCallback, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import useFirebase from "@/hooks/Map/useFirebase";
import useTimer from "@/hooks/Map/useTimer";

const useSendGPS = () => {
  const { myLocation, distance, areaRadius, username } =
    useContext(GameContext);
  const { sendGPS } = useFirebase();
  const { remainingTime, decreaseTime } = useTimer();

  const locationRef = useRef(myLocation);
  const distanceRef = useRef(distance);
  const areaRadiusRef = useRef(areaRadius);
  const remainingTimeRef = useRef(remainingTime);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    locationRef.current = myLocation;
  }, [myLocation]);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    areaRadiusRef.current = areaRadius;
  }, [areaRadius]);

  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

  const startSendingGPS = useCallback(() => {
    // 의도되지 않은 동작으로 새로운 interval을 설정하기 전 기존 interval 정리
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      sendGPS(username, locationRef.current.lat, locationRef.current.lng); // 1초마다 위치 전송

      if (
        remainingTimeRef.current > 0 &&
        distanceRef.current > areaRadiusRef.current
      ) {
        decreaseTime(); // 1초마다 영역 이탈 여부 체크해 시간 감소
      }
    }, 1000);

    return () => clearInterval(intervalIdRef.current);
  }, [username, sendGPS, decreaseTime]);

  return { startSendingGPS };
};

export default useSendGPS;
