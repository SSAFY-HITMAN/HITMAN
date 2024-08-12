import React from "react";
import { Button } from "@/components/ui/Button";
import crosshair from "@/assets/app-icon.png";

const MapCenterButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="absolute right-[1%] top-[1%] z-20 h-12 w-12 rounded-lg border-2 border-black bg-white p-2 hover:bg-white"
    >
      <img src={crosshair} alt="Crosshair" className="h-full w-full" />
    </Button>
  );
};

export default MapCenterButton;
