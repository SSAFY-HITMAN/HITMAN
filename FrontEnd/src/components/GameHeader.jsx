import React, { useContext, useState } from "react";
import { GameContext } from "@/context/GameContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Progress } from "@/components/ui/Progress";

//================= 카메라 미션 =========================

import PopOverCamera from "./ui/PopOverCamera";
import * as Popover from '@radix-ui/react-popover';


// 미션 클릭 때 팝업될 카메라 비디오 인자 전달 
// { publisher, handleMainVideoStream }
const GameHeader = ({ publisher, handleMainVideoStream }) => {
  const [isSpread, setIsSpread] = useState(null);
  const { targetId, missionList } = useContext(GameContext);

//================= 카메라 미션 =========================

  const [openCamera, setOpenCamera] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-700 to-teal-700 p-4">
      <div className="mb-2 font-bold">
        당신의 타겟은 <span className="text-white">"{targetId}"</span>입니다.
      </div>

      <DropdownMenu onOpenChange={open => setIsSpread(open)}>
        <DropdownMenuTrigger asChild>
          <div className="shadow-hard flex h-8 w-full items-center justify-between rounded-full bg-theme-color-2">
            <span className="ml-4 text-sm">미션 진행률</span>

              {/* =============== 카메라 팝업 ============== */}
              <Popover.Root open={open} onOpenChange={setOpenCamera}>
                <Popover.Trigger asChild>
                  <div
                    className="ml-2 mr-2 w-[60%]"
                    onClick={() => setOpenCamera(!openCamera)} // 클릭 시 카메라 팝업 
                  >
                    <Progress
                      value={33}
                      className="border-2 border-gray-300"
                      indicatorClassName="bg-yellow-500 stroke-gray-300"
                    />
                  </div>
                </Popover.Trigger>              
                <PopOverCamera 
                  open={openCamera}  // openCamera 상태 전달
                  publisher={publisher}  // publisher 전달
                  handleMainVideoStream={handleMainVideoStream}  // handleMainVideoStream 전달
                />
              </Popover.Root>
              {/* =============== 카메라 팝업 ============== */}


              {/* 미션 진행률에 따른 value 변화는 추후 수정 */}
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
