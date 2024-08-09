import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import Stomp from "stompjs";
import useReadyGame from "@/hooks/Map/useReadyGame";
import useEndGame from "@/hooks/Map/useEndGame";
import { GameContext } from "@/context/GameContext";
import { WS_BASE_URL } from "@/constants/baseURL";
import { useNavigate, useLocation } from "react-router-dom";

// WebSocket은 게임 방 접속시부터 실행되어야 함
export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const {
    username,
    gameRoomId,
    setGameRoomUsers,
    setGameStatus,
    setTargetId,
    areaRadius,
    setAreaRadius,
  } = useContext(GameContext);
  const stompClient = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const MAX_RECONNECTION_ATTEMPTS = 5; // 최대 재연결 시도 횟수
  const RECONNECT_INTERVAL = 1000; // 재연결 간격 (1초)

  const { setIsLoading } = useReadyGame();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // connect, disconnect 함수 정의
  const connect = useCallback(() => {
    if (
      !gameRoomId ||
      stompClient.current ||
      reconnectAttempts >= MAX_RECONNECTION_ATTEMPTS
    )
      return; // 이미 연결된 상태인지 확인

    // WebSocket 연결 생성
    const socket = new WebSocket(`${WS_BASE_URL}/gameRoom/${gameRoomId}`);
    stompClient.current = Stomp.over(socket);

    // 사용자 이름 가져오기
    const username = localStorage.getItem("username");

    // STOMP 연결 설정
    stompClient.current.connect(
      { username: username }, // 헤더에 username 추가
      frame => {
        console.log("Connected: " + frame);
        setReconnectAttempts(0); // 연결 성공 시 재연결 시도 횟수 초기화

        // 메시지 구독 설정
        stompClient.current.subscribe(
          `/topic/room/${gameRoomId}`,
          serverMsg => {
            const msg = JSON.parse(serverMsg.body);
            handleAlertMessage(msg);
          }
        );
      },
      error => {
        // STOMP 연결 실패 시 에러 로깅 및 재연결 시도
        console.error("STOMP connection error:", error);
        if (reconnectAttempts < MAX_RECONNECTION_ATTEMPTS) {
          setReconnectAttempts(prev => prev + 1);
          setTimeout(connect, RECONNECT_INTERVAL);
        } else {
          alert("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
      }
    );

    // WebSocket 연결이 닫힐 때 자동 재연결
    socket.onclose = () => {
      console.log("WebSocket closed, attempting to reconnect...");
      if (reconnectAttempts < MAX_RECONNECTION_ATTEMPTS) {
        setReconnectAttempts(prev => prev + 1);
        setTimeout(connect, RECONNECT_INTERVAL);
      } else {
        alert("연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    };
  }, [gameRoomId]);

  const disconnect = useCallback(() => {
    if (
      stompClient.current &&
      stompClient.current.ws.readyState === WebSocket.OPEN
    ) {
      stompClient.current.disconnect(() => {
        console.log("Disconnected");
      });
    }
  }, []);

  const handleAlertMessage = msg => {
    switch (msg.msgType) {
      case "start":
        if (gameRoomId) {
          navigate(`/game-play/${gameRoomId}`);
        }
        break;
      case "alert":
        handleAlertDegree(msg.alertDegree);
        break;
      case "end":
        setGameStatus(false);
        useEndGame();
        break;
      case "ready":
        setIsLoading(true); // room.jsx에서 모든 플레이어가 게임 시작 예정 메시지
        break;
      case "target":
        // 타겟이 죽거나 나가서 변동사항 발생 시
        const hunter = msg.hunter;
        if (hunter === username) {
          const newTargetId = msg.target;
          setTargetId(newTargetId);
          sessionStorage.setItem("targetId", newTargetId);
        }
        break;
      case "users":
        setGameRoomUsers(msg.users);
        break;
      default:
        break;
    }
  };

  const handleAlertDegree = degree => {
    switch (degree) {
      case 1:
      case 2:
      case 3:
        const newAreaRadius = areaRadius * 0.75;
        setAreaRadius(newAreaRadius);
        sessionStorage.setItem("areaRadius", newAreaRadius);
        break;
      case 4:
        setGameStatus(false);
        break;
      default:
        break;
    }
  };

  // /room, /game-play에서만 import해서 작동하도록
  // 여기 context와 Room.jsx에만 connect(), disconnect() 활용
  useEffect(() => {
    if (gameRoomId) {
      connect();
    }

    return () => {
      if (
        location.pathname !== `/room/${gameRoomId}` &&
        location.pathname !== `/game-play/${gameRoomId}`
      ) {
        disconnect();
      }
    };
  }, [connect, disconnect, gameRoomId]);

  return (
    <WebSocketContext.Provider value={{ connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
