import { useRef, useEffect, useCallback, useContext } from "react";
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
  const panToMyLocation = useCallback(
    (lat, lng) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setLevel(1, {
          anchor: new kakao.maps.LatLng(lat, lng),
          animate: {
            duration: 500,
          },
        });
      }
    },
    [gameStatus]
  );

  useEffect(() => {
    if (gameStatus && mapRef.current && !mapInstanceRef.current) {
      const options = {
        center: new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
        level: 1,
      };
      const mapInstance = new kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = mapInstance;
    }
  }, [gameStatus]);

  useCircleWithOverlay(mapInstanceRef.current); // 플레이 영역을 표시
  useMarker(mapInstanceRef.current); // 내 위치를 실시간으로 마커 표시
  useTargetMarker(mapInstanceRef.current); // 타겟 위치를 실시간으로 마커 표시

  return { mapRef, panToMyLocation };
};

export default useKakaoMap;
