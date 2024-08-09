import React, { useState, useEffect, useContext } from "react";

import GameHeader from "@/components/GameHeader";
import MapComponent from "@/components/MapComponent";
import CamChattingComponent from "@/components/CamChattingComponent";
import { GameContext } from "@/context/GameContext";

import useGameWebSocket from "@/hooks/WebSocket/useGameWebSocket";
import useStartGame from "@/hooks/Map/useStartGame";
import useSendGPS from "@/hooks/Map/useSendGPS";
import GameTime from "@/components/GameTime";
import useCatchTarget from "@/hooks/Map/useCatchTarget";
import GiveUpButton from "@/components/GiveUpGameButton";
import { Button } from "@/components/ui/Button";

import catchButton from "@/assets/gameplay-icon/catch-button.png";


const GamePlay = () => {
  const { gameStatus } = useContext(GameContext);
  const { fetch, timeUntilStart } = useStartGame();
  const { startSendingGPS } = useSendGPS();
  const { isAbleToCatchTarget, handleOnClickCatchTarget } = useCatchTarget();
  const [camChatting, setCamChatting] = useState(false); // camChatting 상태 초기화
  const { connect, disconnect } = useGameWebSocket();

  const toggleCamChatting = () => {
    setCamChatting(prevState => !prevState); // camChatting 상태 토글 함수
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (gameStatus) {
      const stopSendingGPS = startSendingGPS();
      return () => stopSendingGPS(); // 컴포넌트 unmount 시 GPS 전송 중지
    }
  }, [gameStatus]);

  return (
    <>
      {timeUntilStart > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-3xl text-white">
          게임 시작까지 {Math.max(0, Math.ceil(timeUntilStart / 1000))}초
          남았습니다.
        </div>
      )}

      <GameHeader />

      {camChatting ? (
        <>
          <GameTime />
          <CamChattingComponent 
            gameRoomId={paramGameRoomId}   // gameRoomId를 prop으로 전달
            username={username}            // username을 prop으로 전달
          />
        </>
      ) : (
        <>
          <MapComponent />
          <GameTime />
          <div className="flex justify-between">
            <div />
            <div />
            <img
              src={catchButton}
              alt="catch button"
              onClick={handleOnClickCatchTarget}
              className={`w-60 ${isAbleToCatchTarget ? "" : "cursor-not-allowed opacity-50"}`}
            />
            <div id="mini-buttons" className="mx-3 flex flex-col">
              <Button
                id="item-button"
                className="m-1 h-[8vh] w-[8vh] rounded-full border-2 border-black bg-white text-black"
              >
                Item
              </Button>
              <Button
                id="camchatting-button"
                onClick={toggleCamChatting}
                className="m-1 h-[8vh] w-[8vh] rounded-full border-2 border-black bg-white text-black"
              >
                Cam
              </Button>
              <GiveUpButton />
            </div>
            <div />
          </div>
        </>
      )}
    </>
  );
};

export default GamePlay;
