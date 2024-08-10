import React, { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ClockLoader } from "react-spinners";

import { GameContext } from "@/context/GameContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import GameRuleDialog from "@/components/GameRuleDialog";

import useRoomWebSocket from "@/hooks/WebSocket/useRoomWebSocket";
import useReadyGame from "@/hooks/Map/useReadyGame";

const Room = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { gameRoomId: paramGameRoomId } = useParams();
  const { setGameRoomId, gameRoomUsers } = useContext(GameContext);

  const { connect, disconnect } = useRoomWebSocket();

  // GameSettingDialog 컴포넌트에서 보낸 state에서 QR과 방 코드를 추출
  const location = useLocation();
  const { qrCode, gameCode } = location.state || {};

  const { handleStartGame, isLoading } = useReadyGame();

  const isChief = sessionStorage.getItem("isChief") === "true"; // 방장여부 판단

  // 방에 접속 시 username, gameRoomId 설정 및 WebSocket 연결
  useEffect(() => {
    setGameRoomId(paramGameRoomId);
  }, [paramGameRoomId]);

  useEffect(() => {
    if (gameRoomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [gameRoomId]);

  // isLoading은 useRoomWebSocket.jsx에서 변경
  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      {/* 상단의 절대 위치 버튼들 */}
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="absolute left-12 top-8 h-12 w-32 bg-gradient-to-r from-teal-400 to-blue-700 font-bold shadow-3d"
      >
        게임 규칙
      </Button>
      <GameRuleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      {/* 게임시작 버튼은 방장만 보여주기 */}
      {isChief && (
        <Button
          className="absolute right-12 top-8 h-12 w-32 animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] font-bold shadow-3d"
          onClick={handleStartGame}
        >
          게임 시작
        </Button>
      )}

      {/* 나머지 요소들은 flex로 배치 */}
      <div className="mt-12 flex flex-col items-center justify-center">
        {!isLoading ? (
          <>
            {qrCode && (
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR code"
                className="mb-8 h-40 w-40"
              />
            )}

            {/* 예시 QR */}
            {/* <img
              className="mb-4 h-60 w-60"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQAAAACFI5MzAAABIUlEQVR4Xu2WQXbDIAxExYpjcFMbbsoxWNmdGeK4L6/d9ZVZWM+Ow3wWEwkpjvO3iE/hHQ95COPvSQ1Ewec+yjm4SDak4YZ2dvDGL1JMyIg0ypH7FnAN+8WNIJdb7smVzIx6EdxXRkFeigepbAxqurhINmRGzdyyv9cepOoAHpmJhPHzW0aXEz6lHXTdY3r3IBRQZLruCUT2XUjmxdCA2e6TuJ6g2nQdpX1Wez1pNMsBgy2b8rrbkCoZfqGFItmQpqSG+vjaYkNUah1DDr807t5eTmYgr1W92+5qrydwStcSkM7JTQifGskYLWkufYjenqrqzMh2pF3tO71bkZnRgDzu6bKenKx25f8tuRWBhi5pTCp+wes1yoT8HA95COO/yBdlU+Neyv9lBAAAAABJRU5ErkJggg=="
            /> */}
            <div className="mb-4 text-2xl font-bold">방 코드 : {gameCode}</div>
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

        <Card className="h-60 w-80">
          <CardHeader className="text-center">
            <CardTitle>참가자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {gameRoomUsers.map((user, index) => (
                <div key={index} className="text-center font-bold">
                  {user}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Room;
