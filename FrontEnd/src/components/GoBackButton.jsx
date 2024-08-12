import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

const GoBackButton = ({ to }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(to);
  };

  return (
    <Button
      onClick={handleGoBack}
      className="absolute left-8 top-8 flex items-center justify-center rounded-full bg-white font-black text-black"
    >
      &lt;
    </Button>
  );
};

export default GoBackButton;
