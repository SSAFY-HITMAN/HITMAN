import React, { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ClockLoader } from "react-spinners";

import { GameContext } from "@/context/GameContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import GameRuleDialog from "@/components/GameRuleDialog";

import useRoomWebSocket from "@/hooks/WebSocket/useRoomWebSocket";
import useReadyGame from "@/hooks/Map/useReadyGame";

const Room = () => {
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false); // 게임 규칙
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false); // 참가자 부족 알림

  const { gameRoomId: paramGameRoomId } = useParams();
  const { gameRoomId, setGameRoomId, gameRoomUsers, isGameRoomLoading } =
    useContext(GameContext);
  const { connect, disconnect } = useRoomWebSocket();

  // GameSettingDialog 컴포넌트에서 보낸 state에서 QR과 방 코드를 추출
  const location = useLocation();
  const { qrCode, gameCode } = location.state || {};

  const { handleStartGame } = useReadyGame();

  // 테스트를 위한 최소 인원 제한 없음 
  const handleStartButtonClick = () => {
    if (gameRoomUsers.length >= 3) {
      handleStartGame();
    } else {
      setIsAlertDialogOpen(true);
    }
  };

  const isChief = sessionStorage.getItem("isChief") === "true"; // 방장여부 판단

  if (!isChief) {
    sessionStorage.setItem("isChief", false);
  }

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

  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      {/* 상단의 절대 위치 버튼들 */}
      <Button
        onClick={() => setIsRuleDialogOpen(true)}
        className="absolute left-12 top-8 h-12 w-32 bg-gradient-to-r from-teal-400 to-blue-700 font-bold shadow-3d"
      >
        게임 규칙
      </Button>
      <GameRuleDialog
        isOpen={isRuleDialogOpen}
        onClose={() => setIsRuleDialogOpen(false)}
      />
      {/* 게임시작 버튼은 방장만 보여주기 */}
      {isChief && !isGameRoomLoading && (
        <Button
          className="absolute right-12 top-8 h-12 w-32 animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] font-bold shadow-3d"
          onClick={handleStartButtonClick}
        >
          게임 시작
        </Button>
      )}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="w-60">
          <DialogHeader className="gap-4">
            <DialogTitle>참가자 부족</DialogTitle>
            <hr />
            <DialogDescription>
              최소 플레이 인원은{" "}
              <span className="font-bold text-red-600">3명</span>입니다.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* 나머지 요소들은 flex로 배치 */}
      <div className="mt-12 flex flex-col items-center justify-center">
        {isGameRoomLoading ? (
          // 게임이 시작된 경우: 방장과 플레이어 모두에게 동일한 메시지와 로딩 스피너 표시
          <>
            <ClockLoader
              color="#fff900"
              size={70}
              speedMultiplier={2}
              className="mb-8 animate-bounce"
            />
            <div className="mb-12 animate-pulse text-center text-xl leading-loose">
              방장이 게임을 시작했습니다.
              <br />곧 게임이 시작됩니다!
            </div>
          </>
        ) : isChief ? (
          // 방장이면서 게임이 시작되지 않은 경우: QR 코드와 방 코드 표시
          <>
            {qrCode && (
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR code"
                className="mb-8 h-40 w-40"
              />
            )}
            <div className="mb-4 text-2xl font-bold">방 코드 : {gameCode}</div>
          </>
        ) : (
          // 플레이어면서 게임이 시작되지 않은 경우: 대기 메시지와 로딩 스피너 표시
          <>
            <ClockLoader
              color="#fff900"
              size={70}
              speedMultiplier={2}
              className="mb-8"
            />
            <div className="mb-12 text-center text-xl leading-loose">
              방장이 게임을 시작할 때까지
              <br /> 기다려주세요!
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
