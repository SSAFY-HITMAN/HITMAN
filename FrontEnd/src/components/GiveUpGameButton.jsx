import React, { useState, useEffect, useRef } from "react";
import giveUpIcon from "@/assets/gameplay-icon/giveup-button.svg";

const GiveUpButton = () => {
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const handleClickOutside = event => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setIsClicked(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`m-1 flex h-[8vh] w-[8vh] items-center justify-center rounded-full border-2 shadow-xl transition-colors duration-300 ${
        isClicked ? "border-red-600 bg-red-600" : "border-black bg-white"
      }`}
    >
      <img
        src={giveUpIcon}
        alt="Give Up"
        className={`transition-transform duration-300 ${
          isClicked ? "invert" : "text-red-600"
        } h-3/4 w-3/4`}
      />
    </button>
  );
};

export default GiveUpButton;
