import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "@/context/GameContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMission.jsx";
import { Progress } from "@/components/ui/Progress";

//================= 카메라 미션 =========================

import PopOverCamera from "./ui/PopOverCamera.jsx";
import * as Popover from '@radix-ui/react-popover';


// 미션 클릭 때 팝업될 카메라 비디오 인자 전달 
// { publisher, handleMainVideoStream }
const GameHeader = ({ publisher, handleMainVideoStream }) => {
  const [isSpread, setIsSpread] = useState(null);
  const { targetId, missionList } = useContext(GameContext);

  // const missions = [
  //   { id: 1, name: "미션 이름", description: "미션 내용" }, // 임시 데이터
  //   { id: 2, name: "ddd", description: "hahaha"},
  // ]

//================= 카메라 미션 =========================

  const [openCamera, setOpenCamera] = useState(false);

  const handleMissionClick = (missionId) => {
    setOpenCamera(missionId);
    setIsSpread(true); // 드롭다운을 계속 열어둠
  };

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
            </div>
            <span className="mr-4">{isSpread ? "▲" : "▼"}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80">
          {missionList.map((mission) => (
            <Popover.Root
              key={mission.id}
              open={openCamera === mission.id}
              onOpenChange={() => setOpenCamera(openCamera === mission.id ? null : mission.id)}
            >
              <Popover.Trigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    setOpenCamera(openCamera === mission.id ? null : mission.id)

                  }}
                >
                  <div>
                    {mission.name} : {mission.description}
                  </div>
                </DropdownMenuItem>
              </Popover.Trigger>
              
              <Popover.Content>
                <PopOverCamera 
                  open={openCamera === mission.id}  // 현재 열린 팝업이 해당 미션인지 확인
                  publisher={publisher}  // publisher 전달
                  handleMainVideoStream={handleMainVideoStream}  // handleMainVideoStream 전달
                />
              </Popover.Content>
            </Popover.Root>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GameHeader;