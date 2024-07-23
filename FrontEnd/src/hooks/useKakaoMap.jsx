// import { useRef, useEffect } from 'react';

// const { kakao } = window;

// const useKakaoMap = (location, isLoading, areaCenter) => {
//   // 1. state

//   // 2. constant
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markerRef = useRef(null);

//   const centerMarkerRef = useRef(null);

//   // 3. handler

//   // 4. useEffect
//   // useEffect - Kakao Map 초기화
//   useEffect(() => {
//     if (!isLoading && mapRef.current && !mapInstanceRef.current) {
//       const options = {
//         center: new kakao.maps.LatLng(location.lat, location.lng),
//         level: 1,
//       };
//       const mapInstance = new kakao.maps.Map(mapRef.current, options);
//       mapInstanceRef.current = mapInstance;

//       const marker = new kakao.maps.Marker({
//         position: new kakao.maps.LatLng(location.lat, location.lng),
//         map: mapInstance,
//       });

//       const centerMarker = new kakao.maps.Marker({
//         position: new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
//         map: mapInstance,
//       });
//       markerRef.current = marker;
//       centerMarkerRef.current = centerMarker;
//     }
//   }, [isLoading]);

//   // useEffect - 사용자 위치 업데이트
//   useEffect(() => {
//     if (mapInstanceRef.current && markerRef.current) {
//       const newPosition = new kakao.maps.LatLng(location.lat, location.lng);
//       // mapInstanceRef.current.setCenter(newPosition);
//       markerRef.current.setPosition(newPosition);
//     }
//   }, [location]);

//   return mapRef;
// };

// export default useKakaoMap;

// useKakaoMap.jsx
import { useRef, useEffect } from 'react';

const { kakao } = window;

const useKakaoMap = (location, isLoading, areaCenter) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const centerMarkerRef = useRef(null);

  useEffect(() => {
    if (!isLoading && mapRef.current && !mapInstanceRef.current) {
      const start = performance.now();
      const options = {
        center: new kakao.maps.LatLng(location.lat, location.lng),
        level: 1,
      };
      const mapInstance = new kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = mapInstance;

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(location.lat, location.lng),
        map: mapInstance,
      });

      const centerMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(areaCenter.lat, areaCenter.lng),
        map: mapInstance,
      });
      markerRef.current = marker;
      centerMarkerRef.current = centerMarker;

      const end = performance.now();
      const initTime = (end - start).toFixed(5);

      const resultElem = document.getElementById('map-init-time');
      if (resultElem) {
        resultElem.innerText = `맵 초기화 시간: ${initTime} 밀리초`;
      }
    }
  }, [isLoading]);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const start = performance.now();
      const newPosition = new kakao.maps.LatLng(location.lat, location.lng);
      markerRef.current.setPosition(newPosition);
      const end = performance.now();
      const updateTime = (end - start).toFixed(5);

      const resultElem = document.getElementById('map-update-time');
      if (resultElem) {
        resultElem.innerText = `위치 업데이트 시간: ${updateTime} 밀리초`;
      }
    }
  }, [location]);

  return mapRef;
};

export default useKakaoMap;
