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
      >
        홈으로 돌아가기 ▶
      </Button>
    </div>
  );
};

export default Ending;
