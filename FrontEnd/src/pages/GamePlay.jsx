import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import GameHeader from "@/components/GameHeader";
import MapComponent from "@/components/MapComponent";

import { GameContext } from "@/context/GameContext";
import useFirebase from "@/hooks/Map/useFirebase";
import useTimer from "@/hooks/Map/useTimer";
import PlotGameTime from "@/components/PlotGameTime";
import CatchTargetButton from "@/components/CatchTargetButton";
import useCatchTarget from "@/hooks/Map/useCatchTarget";
import CheckMyItemButton from "@/components/CheckMyItemButton";
import CamChattingButton from "@/components/CamChattingButton";
import GiveUpButton from "@/components/GiveUpGameButton";

const GamePlay = () => {
  const { gameRoomId: paramGameRoomId } = useParams();
  const {
    setGameRoomId,
    gameStatus,
    myLocation,
    areaRadius,
    distance,
    username,
  } = useContext(GameContext);
  const { sendGPS } = useFirebase();
  const { decreaseTime } = useTimer();
  const { isAbleToCatchTarget, handleOnClickCatchTarget } = useCatchTarget();

  useEffect(() => {
    setGameRoomId(paramGameRoomId);
  }, [paramGameRoomId, setGameRoomId]);

  useEffect(() => {
    if (gameStatus && myLocation && distance !== null && areaRadius !== null) {
      const locationInterval = setInterval(() => {
        sendGPS(username, myLocation.lat, myLocation.lng); // 1초마다 위치 전송

        if (distance > areaRadius) {
          decreaseTime(); // 1초마다 영역 이탈 여부 체크해 시간 감소
        }
      }, 1000);

      return () => clearInterval(locationInterval);
    }
  }, [
    gameStatus,
    myLocation,
    distance,
    areaRadius,
    sendGPS,
    username,
    decreaseTime,
  ]);

  return (
    <>
      <GameHeader />
      <MapComponent />
      <PlotGameTime />
      <div className="flex justify-between">
        <div />
        <div />
        <div id="catch-button" className="flex justify-center">
          <CatchTargetButton
            onClick={handleOnClickCatchTarget}
            isDisabled={!isAbleToCatchTarget}
          />
        </div>
        <div />
        <div id="mini-buttons" className="mx-3 flex flex-col">
          <CheckMyItemButton />
          <CamChattingButton />
          <GiveUpButton />
        </div>
        <div />
      </div>
    </>
  );
};

export default GamePlay;
