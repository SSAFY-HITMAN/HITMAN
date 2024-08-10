import { useRef, useEffect, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import useMarker from "./useMarker";
import useTargetMarker from "./useTargetMarker";
import useCircleWithOverlay from "./useCircleWithOverlay";

const { kakao } = window;

const useKakaoMap = () => {
  const { gameStatus, areaCenter } = useContext(GameContext);
  const areaCenterRef = useRef(areaCenter);

  useEffect(() => {
    areaCenterRef.current = areaCenter;
  }, [areaCenter]);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 내 위치로 이동하는 버튼 함수
  const goToLocation = (lat, lng) => {
    if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
      mapInstanceRef.current.setLevel(1, {
        anchor: new kakao.maps.LatLng(lat, lng),
        animate: {
          duration: 500,
        },
      });
    }
  };

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const options = {
        center: new kakao.maps.LatLng(areaCenterRef.current.lat, areaCenterRef.current.lng),
        level: 1,
      };
      const mapInstance = new kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = mapInstance;
    }
  }, [gameStatus, areaCenter]);

  useCircleWithOverlay(mapInstanceRef.current); // 플레이 영역을 표시
  useMarker(mapInstanceRef.current); // 내 위치를 실시간으로 마커 표시
  useTargetMarker(mapInstanceRef.current); // 타겟 위치를 실시간으로 마커 표시

  return { mapRef, goToLocation };
};

export default useKakaoMap;
