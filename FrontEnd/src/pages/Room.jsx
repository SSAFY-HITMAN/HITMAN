import React, { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ClockLoader } from "react-spinners";

import { GameContext } from "@/context/GameContext";

import GameRoomUsers from "@/components/GameRoomUsers";
import { Button } from "@/components/ui/Button";
import useRoomWebSocket from "@/hooks/WebSocket/useRoomWebSocket";

import useReadyGame from "@/hooks/Map/useReadyGame";

import GameRuleDialog from "@/components/GameRuleDialog";

const Room = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { gameRoomId: paramGameRoomId } = useParams();
  const { gameRoomId, setGameRoomId } = useContext(GameContext);
  const { connect, disconnect } = useRoomWebSocket();

  // GameSettingDialog 컴포넌트에서 보낸 state에서 QR과 방 코드를 추출
  const location = useLocation();
  const { qrCode, gameCode } = location.state || {};

  const { handleStartGame, isLoading, error } = useReadyGame();

  const isChief = sessionStorage.getItem("isChief") === "true"; // 방장여부 판단

  // 방에 접속 시 username, gameRoomId 설정 및 WebSocket 연결
  useEffect(() => {
    setGameRoomId(paramGameRoomId);
  }, [paramGameRoomId]);

  useEffect(() => {
    if (gameRoomId) {
      connect();

      return () => {
        disconnect();
      };
    }
  }, [gameRoomId]);

  // isLoading은 useRoomWebSocket.jsx에서 변경
  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="shadow-3d absolute left-12 top-12 mb-8 h-12 w-32 bg-gradient-to-r from-teal-400 to-blue-700 font-bold"
      >
        게임 규칙 요약
      </Button>
      <GameRuleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      {!isLoading ? (
        <>
          {isChief && (
            // 방장에게만 게임시작 버튼 보여주기
            <Button
              className="shadow-3d bg-gradient-rainbow animate-gradient-move absolute right-12 top-12 mb-8 h-12 w-32 bg-[length:200%_200%] font-bold"
              onClick={handleStartGame}
            >
              게임 시작
            </Button>
          )}
          <div>1. QR code</div>
          {qrCode && (
            <img src={qrCode} alt={qrCode} className="mb-8 h-40 w-40" />
          )}

          <div>2. 방 코드</div>
          <div className="mb-8">{gameCode}</div>
        </>
      ) : (
        <>
          {/* 서버에서 start 웹소켓 메시지가 오기 전까지 로딩 스피너 표시 */}
          <ClockLoader
            color="#fff900"
            size={70}
            speedMultiplier={2}
            className="mb-8"
          />
          <div className="mb-12 text-center text-xl leading-loose">
            1분 후 게임이 시작됩니다. <br />
            원하는 위치로 이동해주세요 !
          </div>
        </>
      )}
      <div>3. 현재 참가자 목록</div>
      <GameRoomUsers />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Room;
