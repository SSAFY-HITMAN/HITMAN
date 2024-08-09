import { useEffect, useRef, useContext } from "react";
import { WS_BASE_URL } from "@/constants/baseURL";
import Stomp from "stompjs";
import useReadyGame from "@/hooks/Map/useReadyGame";
import { GameContext } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";

const useRoomWebSocket = () => {
  const { gameRoomId, setGameRoomUsers } = useContext(GameContext);
  const { setIsLoading } = useReadyGame();
  const navigate = useNavigate();
  const stompClient = useRef(null);

  const gameRoomIdRef = useRef(null);
  useEffect(() => {
    gameRoomIdRef.current = gameRoomId;
  }, [gameRoomId]);

  const connect = () => {
    // WebSocket 연결 생성
    const socket = new WebSocket(
      `${WS_BASE_URL}/gameRoom/${gameRoomIdRef.current}`
    );
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
          `/topic/waiting/${gameRoomIdRef.current}`,
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
        console.log("Disconnected");
      });
      stompClient.current = null;
    }
  };

  const handleAlertMessage = msg => {
    switch (msg.msgType) {
      case "users":
        setGameRoomUsers(msg.users);
        break;
      case "ready":
        setIsLoading(true);
        break;
      case "start":
        if (gameRoomIdRef.current) {
          navigate(`/game-play/${gameRoomIdRef.current}`);
        }
        break;
      default:
        break;
    }
  };

  return { connect, disconnect };
};

export default useRoomWebSocket;
