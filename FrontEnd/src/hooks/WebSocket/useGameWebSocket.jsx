import { useEffect, useRef, useContext } from "react";
import { WS_BASE_URL } from "@/constants/baseURL";
import Stomp from "stompjs";
import useEndGame from "@/hooks/Map/useEndGame";
import { GameContext } from "@/context/GameContext";

const useGameWebSocket = () => {
  const { areaRadius, setGameStatus, setTargetId } = useContext(GameContext);
  const { endGame } = useEndGame();
  const { gameRoomId, setAreaRadius } = useContext(GameContext);
  const stompClient = useRef(null);
  const areaRadiusRef = useRef(areaRadius);

  useEffect(() => {
    areaRadiusRef.current = areaRadius;
  }, [areaRadius]);

  const connect = () => {
    // WebSocket 연결 생성
    const socket = new WebSocket(`${WS_BASE_URL}/gameRoom/${gameRoomId}`);
    stompClient.current = Stomp.over(socket);

    // 사용자 이름 가져오기
    const username = localStorage.getItem("username");

    // STOMP 연결 설정
    stompClient.current.connect(
      { username: username }, // 헤더에 username 추가
      frame => {
        console.log("Connected:" + frame);

        // 메시지 구독 설정
        stompClient.current.subscribe(
          `/topic/play/${gameRoomId}`,
          serverMsg => {
            const msg = JSON.parse(serverMsg.body);
            handleAlertMessage(msg);
          }
        );
      },
      error => {
        console.error("STOMP connection error:", error);
      }
    );
  };

  const disconnect = () => {
    if (
      stompClient.current &&
      stompClient.current.ws.readyState === WebSocket.OPEN
    ) {
      stompClient.current.disconnect(() => {
        console.log("Disconnect");
      });
      stompClient.current = null;
    }
  };

  const handleAlertMessage = msg => {
    switch (msg.msgType) {
      case "target":
        // 타겟이 죽거나 나가서 변동사항 발생 시
        const hunter = msg.hunter;
        const username = localStorage.getItem("username");
        if (hunter === username) {
          const newTargetId = msg.target;
          setTargetId(newTargetId);
          sessionStorage.setItem("targetId", newTargetId);
        }
        break;
      case "alert":
        handleAlertDegree(msg.alertDegree);
        break;
      case "end":
        setGameStatus(false);
        endGame();
        break;
      default:
        break;
    }
  };

  const handleAlertDegree = degree => {
    switch (degree) {
      case "1":
      case "2":
      case "3":
        const newAreaRadius = areaRadiusRef.current * 0.75;
        setAreaRadius(newAreaRadius);
        sessionStorage.setItem("areaRadius", newAreaRadius);
        break;
      case "4":
        setGameStatus(false);
        endGame();
        break;
      default:
        break;
    }
  };

  return { connect, disconnect };
};

export default useGameWebSocket;
