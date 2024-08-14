import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import targetMarkerImage from "@/assets/gameplay-icon/target-marker.png";

const { kakao } = window;

const useTargetMarker = mapInstance => {
  const markerRef = useRef(null);
  const { targetLocation, gameStatus, blockGPS } = useContext(GameContext);

  const imageSize = new kakao.maps.Size(45, 45);
  const markerImage = new kakao.maps.MarkerImage(targetMarkerImage, imageSize);

  // 타겟 위치 변동에 따라 마커를 새로 set
  useEffect(() => {
    if (gameStatus && markerRef.current && targetLocation) {
      if (!blockGPS) {
        // blockGPS가 false이면 마커 위치 업데이트
        const newPosition = new kakao.maps.LatLng(
          targetLocation.lat,
          targetLocation.lng
        );
        markerRef.current.setPosition(newPosition);

        if (!markerRef.current.getMap()) {
          // 마커가 숨겨져 있는 경우에만 다시 지도에 표시
          markerRef.current.setMap(mapInstance);
        }
      } else {
        // blockGPS가 true라면 마커 숨기기
        markerRef.current.setMap(null);
      }
    }
  }, [targetLocation, gameStatus, blockGPS]);

  // 지도 생성 시 마커 생성 후 지도에 표시
  // gameStatus에 따라 markerRef가 null인지, 새로 생성하는지 결정
  useEffect(() => {
    if (gameStatus && mapInstance && targetLocation && !markerRef.current) {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(targetLocation.lat, targetLocation.lng),
        image: markerImage,
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
