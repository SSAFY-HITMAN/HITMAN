import React from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import EndPageRankTable from "@/components/EndPageRankTable";

const Ending = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center">
      <EndPageRankTable />
      <Button
        onClick={() => {
          const itemsToRemove = ["winner1", "winner2", "result"];
          itemsToRemove.forEach(item => sessionStorage.removeItem(item));
          navigate("/home");
        }}
        className="h-12 w-60 animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] text-lg font-bold shadow-3d"
      >
        메인으로 돌아가기
      </Button>
    </div>
  );
};

export default Ending;
