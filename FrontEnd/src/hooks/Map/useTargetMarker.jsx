import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const { kakao } = window;

const useTargetMarker = mapInstance => {
  const markerRef = useRef(null);
  const { targetLocation, gameStatus, blockGPS } = useContext(GameContext);

  // 타겟 위치 변동에 따라 마커를 새로 set
  useEffect(() => {
    if (gameStatus && markerRef.current && targetLocation && !blockGPS) {
      // blockGPS 아이템 조건
      const newPosition = new kakao.maps.LatLng(
        targetLocation.lat,
        targetLocation.lng
      );
      markerRef.current.setPosition(newPosition);
    }
  }, [targetLocation, gameStatus, blockGPS]);

  // 지도 생성 시 마커 생성 후 지도에 표시
  // gameStatus에 따라 markerRef가 null인지, 새로 생성하는지 결정
  useEffect(() => {
    if (gameStatus && mapInstance && targetLocation && !markerRef.current) {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(targetLocation.lat, targetLocation.lng),
        map: mapInstance,
      });
      markerRef.current = marker;
    } else if (!gameStatus && markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, [mapInstance, targetLocation, gameStatus]);

  return markerRef;
};

export default useTargetMarker;
