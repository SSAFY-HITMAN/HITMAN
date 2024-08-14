import { useRef, useContext } from "react";
import { WS_BASE_URL } from "@/constants/baseURL";
import Stomp from "stompjs";
import { GameContext } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";

const useRoomWebSocket = () => {
  const { gameRoomId, setGameRoomUsers, setIsGameRoomLoading } =
    useContext(GameContext);
  const navigate = useNavigate();
  const stompClient = useRef(null);

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
          `/topic/waiting/${gameRoomId}`,
          serverMsg => {
            // 메시지 구독여부 디버깅
            try {
              const msg = JSON.parse(serverMsg.body);
              console.log("룸웹소켓 메시지 수신 완료:", msg); // 이 메시지가 안나오면 구독 경로 또는 WebSocket 서버 설정 문제
              handleAlertMessage(msg);
            } catch (error) {
              console.error("룸웹소켓 메시지 수신 실패:", error);
            }
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
        setIsGameRoomLoading(true);
        break;
      case "start":
        if (gameRoomId) {
          navigate(`/game-play/${gameRoomId}`);
        }
        break;
      default:
        break;
    }
  };

  return { connect, disconnect };
};

export default useRoomWebSocket;
