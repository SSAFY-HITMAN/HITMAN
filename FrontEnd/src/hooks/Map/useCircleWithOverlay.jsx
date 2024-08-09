import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const { kakao } = window;

// computeOffset 함수 작성
const computeOffset = (center, distance, angle) => {
  const earthRadius = 6371000; // 지구 반지름 (미터)
  const radianAngle = (angle * Math.PI) / 180;
  const lat1 = (center.getLat() * Math.PI) / 180;
  const lng1 = (center.getLng() * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / earthRadius) +
      Math.cos(lat1) * Math.sin(distance / earthRadius) * Math.cos(radianAngle)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(radianAngle) * Math.sin(distance / earthRadius) * Math.cos(lat1),
      Math.cos(distance / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
    );

  return new kakao.maps.LatLng((lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI);
};

const useCircleWithOverlay = mapInstance => {
  const { areaCenter, areaRadius } = useContext(GameContext);
  const polygonRef = useRef(null);
  const centerPointRef = useRef(null);

  useEffect(() => {
    if (mapInstance && areaCenter && areaRadius) {
      const createOverlay = () => {
        const worldCoords = [
          new kakao.maps.LatLng(31, 120),
          new kakao.maps.LatLng(44, 120),
          new kakao.maps.LatLng(44, 135),
          new kakao.maps.LatLng(31, 135),
          new kakao.maps.LatLng(31, 120),
        ];

        const innerPath = [];
        const points = 360; // 원을 나타낼 점의 개수
        for (let i = 0; i < points; i++) {
          const angle = (i * 360) / points;
          const latLng = computeOffset(
            new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
            areaRadius,
            angle
          );
          innerPath.push(latLng);
        }

        const polygon = new kakao.maps.Polygon({
          // 한반도 전체를 덮고, 플레이 중심 위치와 반경 정보를 이용해 플레이 영역만 덮지 않는 폴리곤(구멍난 다각형) 생성
          path: [worldCoords, innerPath],
          strokeWeight: 0,
          fillColor: "#000000",
          fillOpacity: 0.25,
        });

        polygon.setMap(mapInstance);
        polygonRef.current = polygon;

        // 플레이 중심 위치를 점으로 별도 표시
        const centerPoint = new kakao.maps.Circle({
          center: new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
          radius: 0.25,
          strokeWeight: 5,
          strokeColor: "#000000",
          fillcolor: "#000000",
        });

        centerPoint.setMap(mapInstance);
        centerPointRef.current = centerPoint;
      };

      // 기존 폴리곤과 중심 점 제거
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }

      if (centerPointRef.current) {
        centerPointRef.current.setMap(null);
        centerPointRef.current = null;
      }

      // 오버레이 생성
      createOverlay();
    }
  }, [mapInstance, areaCenter, areaRadius]);

  return { polygonRef, centerPointRef };
};

export default useCircleWithOverlay;
