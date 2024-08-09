import React, { useContext, useState } from "react";
import { GameContext } from "@/context/GameContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Progress } from "@/components/ui/Progress";

const GameHeader = () => {
  const [isSpread, setIsSpread] = useState(null);
  const { targetId, missionList } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-700 to-teal-700 p-4">
      <div className="mb-2 font-bold">
        당신의 타겟은 <span className="text-white">"{targetId}"</span>입니다.
      </div>
      <DropdownMenu onOpenChange={open => setIsSpread(open)}>
        <DropdownMenuTrigger asChild>
          <div className="shadow-hard flex h-8 w-full items-center justify-between rounded-full bg-theme-color-2">
            <span className="ml-4 text-sm">미션 진행률</span>
            <div className="ml-2 mr-2 w-[60%]">
              <Progress
                value={33}
                className="border-2 border-gray-300"
                indicatorClassName="bg-yellow-500 stroke-gray-300"
              />
              {/* 미션 진행률에 따른 value 변화는 추후 수정 */}
            </div>
            <span className="mr-4">{isSpread ? "▲" : "▼"}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80">
          {missionList.map(mission => (
            <DropdownMenuItem key={mission.id}>
              {/* 정확한 렌더링 형식은 추후 수정 */}
              {mission.name} : {mission.description}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GameHeader;
