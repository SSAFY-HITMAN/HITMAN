import { useRef, useEffect, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import useMarker from "./useMarker";
import useTargetMarker from "./useTargetMarker";
import useCircleWithOverlay from "./useCircleWithOverlay";

const { kakao } = window;

const useKakaoMap = () => {
  const { gameStatus, areaCenter } = useContext(GameContext);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 내 위치로 이동하는 버튼 함수
  const goToLocation = (lat, lng) => {
    if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
      const newLocation = new kakao.maps.LatLng(lat, lng);
      mapInstanceRef.current.setLevel(1, { animate: true });
      mapInstanceRef.current.panTo(newLocation);
    }
  };

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // 지도 초기화
      const options = {
        center: new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
        level: 1,
      };
      const mapInstance = new kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = mapInstance;
    } else if (mapInstanceRef.current) {
      // 지도 중심 업데이트
      mapInstanceRef.current.setCenter(
        new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng)
      );
    }
  }, [areaCenter]);

  useCircleWithOverlay(mapInstanceRef.current); // 플레이 영역을 표시
  useMarker(mapInstanceRef.current); // 내 위치를 실시간으로 마커 표시
  useTargetMarker(mapInstanceRef.current); // 타겟 위치를 실시간으로 마커 표시

  return { mapRef, goToLocation };
};

export default useKakaoMap;
