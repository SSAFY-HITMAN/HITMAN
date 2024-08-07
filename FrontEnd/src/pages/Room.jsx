import React, { useContext, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { WebSocketContext } from "@/context/WebSocketContext";
import { GameContext } from "@/context/GameContext";
import GameRoomUsers from "@/components/GameRoomUsers";
import useStartGame from "@/hooks/Map/useStartGame";
import loadingSpinner from "@/assets/loading-spinner.gif";
import { Button } from "@/components/ui/Button";

const Room = () => {
  const { gameRoomId: paramGameRoomId } = useParams();
  const { gameStatus, gameRoomId, setGameRoomId } = useContext(GameContext);
  const { connect } = useContext(WebSocketContext);
  const navigate = useNavigate();

  // GameSettingDialog 컴포넌트에서 보낸 state에서 QR과 방 코드를 추출
  const location = useLocation();
  const { qrCode, gameCode } = location.state || {};

  const { handleStartGame, isLoading, error } = useStartGame();

  // 방에 접속 시 username, gameRoomId 설정 및 WebSocket 연결
  useEffect(() => {
    setGameRoomId(paramGameRoomId);
    connect();
  }, [connect, paramGameRoomId]);

  useEffect(() => {
    // WebSocketContext.jsx에서 메시지 수신 여부에 따라 gameStatus true로 변경
    // gameStatus 변동 시 /game-play로 이동하도록 함
    if (gameStatus && gameRoomId) {
      navigate(`/game-play/${gameRoomId}`);
    }
  }, [navigate, gameStatus, gameRoomId]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
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
