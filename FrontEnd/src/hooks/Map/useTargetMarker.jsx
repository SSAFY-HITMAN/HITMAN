import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const { kakao } = window;

const useTargetMarker = mapInstance => {
  const markerRef = useRef(null);
  const { targetLocation } = useContext(GameContext);
  const targetLocationRef = useRef(targetLocation);

  // 타겟 위치 변동에 따라 마커를 새로 set
  useEffect(() => {
    targetLocationRef.current = targetLocation;

    if (markerRef.current && targetLocation) {
      const newPosition = new kakao.maps.LatLng(
        targetLocation.lat,
        targetLocation.lng
      );
      markerRef.current.setPosition(newPosition);
    }
  }, [targetLocation]);

  // 지도 최초 생성 시, 마커 생성 후 지도에 표시
  useEffect(() => {
    if (mapInstance && targetLocationRef.current && !markerRef.current) {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(
          targetLocationRef.current.lat,
          targetLocationRef.current.lng
        ),
        map: mapInstance,
      });
      markerRef.current = marker;
    }
  }, [mapInstance]);

  return markerRef;
};

export default useTargetMarker;
