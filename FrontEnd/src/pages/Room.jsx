import React, { useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GameContext } from "@/context/GameContext";
import GameRoomUsers from "@/components/GameRoomUsers";
import useReadyGame from "@/hooks/Map/useReadyGame";
import loadingSpinner from "@/assets/loading-spinner.gif";
import { Button } from "@/components/ui/Button";
import useRoomWebSocket from "@/hooks/WebSocket/useRoomWebSocket";

const Room = () => {
  const { gameRoomId: paramGameRoomId } = useParams();
  const { setGameRoomId } = useContext(GameContext);
  const { connect, disconnect } = useRoomWebSocket();

  // GameSettingDialog 컴포넌트에서 보낸 state에서 QR과 방 코드를 추출
  const location = useLocation();
  const { qrCode, gameCode } = location.state || {};

  const { handleStartGame, isLoading, error } = useReadyGame();

  // 방에 접속 시 username, gameRoomId 설정 및 WebSocket 연결
  useEffect(() => {
    setGameRoomId(paramGameRoomId);
  }, [paramGameRoomId]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // isLoading은 useRoomWebSocket.jsx에서 변경
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {isLoading ? (
        <>
          {/* 서버에서 start 웹소켓 메시지가 오기 전까지 로딩 스피너 표시 */}
          <img src={loadingSpinner} alt="loading-spinner" className="w-32" />
          <div className="mb-8 font-bold">잠시 후 게임이 시작됩니다.</div>
        </>
      ) : (
        <>
          <div>1. QR code</div>
          {qrCode && (
            <img src={qrCode} alt={qrCode} className="mb-8 h-40 w-40" />
          )}

          <div>2. 방 코드</div>
          <div className="mb-8">{gameCode}</div>
        </>
      )}
      <div>3. 현재 참가자 목록</div>
      <GameRoomUsers />

      <Button
        className="mb-8 bg-theme-color-1 font-bold"
        onClick={handleStartGame}
      >
        게임 시작
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Room;
