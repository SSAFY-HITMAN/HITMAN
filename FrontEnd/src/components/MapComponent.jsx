import React, { useEffect, useRef, useContext } from "react";
import useKakaoMap from "@/hooks/Map/useKakaoMap";

import { GameContext } from "@/context/GameContext";
import crosshair from "@/assets/material-icon/profile-icon.svg";

const MapComponent = () => {
  const { myLocation, distance, areaRadius } = useContext(GameContext);
  const { mapRef, goToLocation } = useKakaoMap();
  const myLocationRef = useRef(myLocation);

  useEffect(() => {
    myLocationRef.current = myLocation;
  }, [myLocation]);

  const handleOnClickCenter = () => {
    const { lat, lng } = myLocationRef.current;
    goToLocation(lat, lng);
  };

  // 오버레이 컴포넌트를 MapComponent 내부에 정의
  const MapOverlay = () => {
    return (
      distance > areaRadius && (
        <div
          className="pointer-events-none absolute z-20 h-full w-full -translate-x-1/2 -translate-y-1/2 animate-ping bg-red-700 opacity-30"
          style={{
            top: "50%",
            left: "50%",
            overflow: "hidden",
          }}
        />
      )
    );
  };

  return (
    <div className="flex justify-center">
      <div className="w-full p-2">
        <div id="map-wrap" className="relative">
          <div
            id="map"
            ref={mapRef}
            className="z-10 h-[45vh] w-full rounded-lg"
          />
          <img
            id="map-center-button"
            src={crosshair}
            alt="Crosshair"
            onClick={handleOnClickCenter}
            className="border-1 absolute right-[3%] top-[3%] z-20 h-12 w-12 rounded-lg border-black bg-gradient-to-r from-amber-300 to-amber-500 shadow-3d"
          />
        </div>
        <MapOverlay />
      </div>
    </div>
  );
};

export default MapComponent;
