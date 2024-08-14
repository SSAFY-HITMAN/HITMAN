import { useEffect, useRef, useContext } from "react";
import { WS_BASE_URL } from "@/constants/baseURL";
import Stomp from "stompjs";
import useEndGame from "@/hooks/Map/useEndGame";
import { GameContext } from "@/context/GameContext";

const useGameWebSocket = () => {
  const {
    areaRadius,
    setGameStatus,
    setTargetId,
    setIsAlive,
    setPlayerCount,
    username,
    setToOffChatting,
    setBlockGPS,
    setBlockScreen,
    setDistToCatch,
    DISTANCE_TO_CATCH,
  } = useContext(GameContext);
  const { endGame } = useEndGame();
  const { gameRoomId, setAreaRadius } = useContext(GameContext);
  const stompClient = useRef(null);
  const areaRadiusRef = useRef(areaRadius);
  const effectTimeoutRef = useRef(null); // 현재 실행 중인 타이머를 저장하는 변수

  useEffect(() => {
    areaRadiusRef.current = areaRadius;
  }, [areaRadius]);

  const connect = () => {
    // WebSocket 연결 생성
    console.log("test");
    console.log(`${WS_BASE_URL}/gameRoom/${gameRoomId}`);
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
            // 메시지 구독여부 디버깅
            try {
              const msg = JSON.parse(serverMsg.body);
              console.log("웹소켓 메시지 수신 완료:", msg); // 이 메시지가 안나오면 구독 경로 또는 WebSocket 서버 설정 문제
              handleAlertMessage(msg);
            } catch (error) {
              console.error("웹소켓 메시지 수신 실패:", error);
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
        console.log("Disconnect");
      });
      stompClient.current = null;
    }
  };

  const handleAlertMessage = msg => {
    switch (msg.msgType) {
      case "changeTarget":
        // 타겟이 죽거나 나가서 변동사항 발생 시
        const hunter = msg.hunter;
        if (hunter === username) {
          const newTargetId = msg.target;
          setTargetId(newTargetId);
          sessionStorage.setItem("targetId", newTargetId);
          alert(`타겟 변경: ${newTargetId}`);
        }
        break;
      case "eliminated":
        // 잡힘 알림
        if (username === msg.user) {
          setIsAlive(false);
          setTargetId(null);
          sessionStorage.setItem("isAlive", false);
          sessionStorage.removeItem("targetId");
          alert(`사망했습니다!`);
        }
        break;
      case "alert":
        handleAlertDegree(msg.alertDegree);
        alert(`alert: ${msg.alertDegree}`);
        break;
      case "end": // 게임 종료 조건(인원수)
        setGameStatus(false);
        setToOffChatting(true); // 종료 시 true로 변환
        alert("게임 종료!");
        const data = JSON.parse(msg.data);
        endGame(data);
        break;
      case "playerCount":
        const count = parseInt(msg.count, 10);
        console.log("웹소켓 메시지로 받는 남은 인원수 : " + count);
        setPlayerCount(count);
        alert(`남은 인원 수: ${count}`);
        break;
      case "useItem":
        const effect = msg.effect;
        const affected = msg.username;
        if (username === affected) {
          handleItemEffect(effect);
          alert(`아이템을 맞았습니다! ${effect}`);
        }
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
      default:
        break;
    }
  };

  const handleItemEffect = effect => {
    // 현재 적용 중인 아이템 효과가 있다면 먼저 클리어
    clearEffect();

    // 기존 타이머가 있다면 클리어
    if (effectTimeoutRef.current) {
      clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = null;
    }

    sessionStorage.setItem("effectStartTime", Date.now());
    sessionStorage.setItem("effectExpirationTime", Date.now() + 30 * 1000);

    if (effect === "blockScreen") {
      sessionStorage.setItem("itemInEffect", "blockScreen");
      alert("방해 폭탄 공격");
      setBlockScreen(true); // GamePlay.jsx
      effectTimeoutRef.current = setTimeout(() => {
        setBlockScreen(false);
        if (sessionStorage.getItem("itemInEffect") === "blockScreen") {
          sessionStorage.removeItem("itemInEffect");
          sessionStorage.removeItem("effectStartTime");
          sessionStorage.removeItem("effectExpirationTime");
        }
      }, 30 * 1000);
    } else if (effect === "blockGPS") {
      sessionStorage.setItem("itemInEffect", "blockGPS");
      alert("스텔스 망토 작동");
      setBlockGPS(true); // useTargetMarker.jsx
      effectTimeoutRef.current = setTimeout(() => {
        setBlockGPS(false);
        if (sessionStorage.getItem("itemInEffect") === "blockGPS") {
          sessionStorage.removeItem("itemInEffect");
          sessionStorage.removeItem("effectStartTime");
          sessionStorage.removeItem("effectExpirationTime");
        }
      }, 30 * 1000);
    }
  };

  const clearEffect = () => {
    if (sessionStorage.getItem("itemInEffect") === "enhancedBullet") {
      setDistToCatch(DISTANCE_TO_CATCH);
    }
    setBlockScreen(false);
    setBlockGPS(false);
    sessionStorage.removeItem("effectStartTime");
    sessionStorage.removeItem("effectExpirationTime");
    sessionStorage.removeItem("itemInEffect");

    // 기존 타이머가 있다면 클리어
    if (effectTimeoutRef.current) {
      clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = null;
    }
  };

  return { connect, disconnect };
};

export default useGameWebSocket;
