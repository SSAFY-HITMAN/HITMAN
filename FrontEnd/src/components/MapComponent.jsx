import React, { useEffect, useRef, useContext } from "react";
import useKakaoMap from "@/hooks/Map/useKakaoMap";

import { GameContext } from "@/context/GameContext";
import crosshair from "@/assets/material-icon/profile-icon.svg";

const MapComponent = () => {
  const { myLocation } = useContext(GameContext);
  const { mapRef, goToLocation } = useKakaoMap();
  const myLocationRef = useRef(myLocation);

  useEffect(() => {
    myLocationRef.current = myLocation;
  }, [myLocation]);

  const handleOnClickCenter = () => {
    const { lat, lng } = myLocationRef.current;
    goToLocation(lat, lng);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full p-2">
        <div id="map-wrap" className="relative">
          <div
            id="map"
            ref={mapRef}
            className="z-10 h-[45vh] w-full rounded-lg border-2 border-black"
          />
          <img
            id="map-center-button"
            src={crosshair}
            alt="Crosshair"
            onClick={handleOnClickCenter}
            className="border-1 absolute right-[1%] top-[1%] z-20 h-12 w-12 rounded-lg border-black bg-teal-200"
          />
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
