import React from "react";
import { Button } from "@/components/ui/Button";
import catchTargetButtonImage from "@/assets/gameplay-icon/catch-target-button-image.png";

const CatchTargetButton = ({ onClick, isDisabled }) => {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      className={`z-10 h-[24vh] w-[24vh] rounded-lg bg-white p-0 hover:bg-white ${
        isDisabled ? "cursor-not-allowed" : ""
      }`}
    >
      <img
        src={catchTargetButtonImage}
        alt="Catch Target"
        className={`mt-3 h-[80%] object-cover ${isDisabled ? "opacity-50" : ""}`}
      />
    </Button>
  );
};

export default CatchTargetButton;
