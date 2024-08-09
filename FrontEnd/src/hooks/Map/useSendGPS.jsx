import { useEffect, useCallback, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import useFirebase from "@/hooks/Map/useFirebase";
import useTimer from "@/hooks/Map/useTimer";

const useSendGPS = () => {
  const { myLocation, distance, areaRadius, username } =
    useContext(GameContext);
  const { sendGPS } = useFirebase();
  const { decreaseTime } = useTimer();

  const locationRef = useRef(myLocation);
  const distanceRef = useRef(distance);
  const areaRadiusRef = useRef(areaRadius);

  useEffect(() => {
    locationRef.current = myLocation;
  }, [myLocation]);

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    areaRadiusRef.current = areaRadius;
  }, [areaRadius]);

  const startSendingGPS = useCallback(() => {
    const locationInterval = setInterval(() => {
      sendGPS(username, locationRef.current.lat, locationRef.current.lng); // 1초마다 위치 전송

      if (distanceRef.current > areaRadiusRef.current) {
        decreaseTime(); // 1초마다 영역 이탈 여부 체크해 시간 감소
      }
    }, 1000);

    return () => clearInterval(locationInterval);
  }, [username, sendGPS, decreaseTime]);

  return { startSendingGPS };
};

export default useSendGPS;
