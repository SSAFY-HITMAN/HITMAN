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
import * as Popover from "@radix-ui/react-popover";

// 미션 클릭 때 팝업될 카메라 비디오 인자 전달
// { publisher, handleMainVideoStream }
const GameHeader = ({ publisher, handleMainVideoStream }) => {
  const [isSpread, setIsSpread] = useState(null);
  const { targetId, missionList } = useContext(GameContext);

  const missions = [
    { id: 1, name: "미션 이름", description: "미션 내용" }, // 임시 데이터
    { id: 2, name: "ddd", description: "hahaha" },
  ];

  //================= 카메라 미션 =========================

  const [openCamera, setOpenCamera] = useState(false);

  const handleMissionClick = missionId => {
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
          <div className="shadow-hard bg-theme-color-2 flex h-8 w-full items-center justify-between rounded-full">
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
          {missionList.map(mission => (
            <Popover.Root
              key={mission.missionId}
              open={openCamera === mission.missionId}
              onOpenChange={() =>
                setOpenCamera(
                  openCamera === mission.missionId ? null : mission.missionId
                )
              }
            >
              <Popover.Trigger asChild>
                <DropdownMenuItem
                  onClick={e => {
                    // setOpenCamera(openCamera === mission.id ? null : mission.id)
                    e.preventDefault();
                    setOpenCamera(mission.missionId);
                  }}
                  className={`m-1 ${mission.done ? "inset-0 z-40 bg-black bg-opacity-75 text-white line-through" : ""}`}
                >
                  <div>
                    {
                      mission.category === 1 ? (
                        <span>
                          📜 &nbsp; &nbsp; "{mission.target}" 또는 "
                          {mission.alt}" 촬영하기
                        </span>
                      ) : mission.category === 2 ? (
                        <span>
                          📜 &nbsp; &nbsp; "{mission.target}" 촬영하기
                        </span>
                      ) : mission.category === 3 ? (
                        <span>
                          📜 &nbsp; &nbsp; 비슷한 색 찾기:
                          <span
                            style={{
                              display: "inline-block",
                              width: "30px", // 직사각형의 너비
                              height: "30px", // 직사각형의 높이
                              backgroundColor: mission.target, // 배경색을 mission.target의 색으로 설정
                              marginLeft: "8px", // 텍스트와 직사각형 사이에 약간의 간격 추가
                              verticalAlign: "middle", // 텍스트와 직사각형을 같은 높이에 맞추기 위해 중간 정렬
                            }}
                          />
                        </span>
                      ) : (
                        `미션이 없습니다.`
                      ) // Default rendering
                    }
                  </div>
                </DropdownMenuItem>
              </Popover.Trigger>

              <Popover.Content style={{ zIndex: 9999 }}>
                <PopOverCamera
                  open={openCamera === mission.missionId} // 현재 열린 팝업이 해당 미션인지 확인
                  publisher={publisher} // publisher 전달
                  missionId={mission.missionId}
                  handleMainVideoStream={handleMainVideoStream} // handleMainVideoStream 전달
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
