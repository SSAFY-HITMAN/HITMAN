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
  const reconnectAttempts = useRef(0); // 재연결 시도 횟수를 저장하는 변수
  const maxReconnectAttempts = 5; // 최대 재연결 시도 횟수

  useEffect(() => {
    areaRadiusRef.current = areaRadius;
  }, [areaRadius]);

  // 끊길 시 재연결에 관한 로직
  const handleDisconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;
      console.log(
        `재연결 시도 중... (${reconnectAttempts.current}/${maxReconnectAttempts})`
      );
      setTimeout(() => {
        connect();
      }, 1000); // 1초 후 재연결 시도
    } else {
      console.error(
        "최대 재연결 시도 횟수를 초과했습니다. 페이지를 새로고침합니다."
      );
      window.location.reload(); // 최대 시도 횟수를 초과하면 페이지 새로고침
    }
  };

  const connect = () => {
    // 기본 연결 상태 체크
    if (
      stompClient.current &&
      stompClient.current.ws.readyState === WebSocket.OPEN
    ) {
      console.log("이미 연결된 WebSocket이 있습니다.");
      return;
    }

    // WebSocket 연결 생성
    console.log(
      `게임웹소켓 연결 시도중... : ${WS_BASE_URL}/gameRoom/${gameRoomId}`
    );
    const socket = new WebSocket(`${WS_BASE_URL}/gameRoom/${gameRoomId}`);

    stompClient.current = Stomp.over(socket);

    // 사용자 이름 가져오기
    const username = localStorage.getItem("username");

    // STOMP 연결 설정
    stompClient.current.connect(
      { username: username }, // 헤더에 username 추가
      frame => {
        console.log("게임웹소켓 연결 완료, frame:", frame);

        // 재연결 시도 횟수 초기화
        reconnectAttempts.current = 0;

        // 메시지 구독 설정
        stompClient.current.subscribe(
          `/topic/play/${gameRoomId}`,
          serverMsg => {
            console.log("서버에서 게임웹소켓 메시지 수신됨:", serverMsg.body);
            try {
              const msg = JSON.parse(serverMsg.body);
              console.log("게임웹소켓 메시지 수신 완료:", msg); // 이 메시지가 안나오면 구독 경로 또는 WebSocket 서버 설정 문제
              handleAlertMessage(msg);
            } catch (error) {
              console.error("게임웹소켓 메시지 수신 실패:", error);
            }
            // let jsonString = serverMsg.body;
            // try {
            //   // 먼저 JSON 파싱 시도
            //   let parsedData = JSON.parse(jsonString);

            //   // 만약 `result`가 문자열로 되어 있다면
            //   if (typeof parsedData.result === "string") {
            //     parsedData.result = JSON.parse(parsedData.result);
            //   }

            //   console.log(`parsedData: ${parsedData}`);
            //   handleAlertDegree(parsedData);
            // } catch (error) {
            //   console.error("JSON 파싱 실패:", error);
            // }
          }
        );
      },
      error => {
        console.error("STOMP connection error:", error);
        handleDisconnect();
      }
    );

    socket.onclose = () => {
      console.log("WebSocket 연결이 종료되었습니다.");
      handleDisconnect();
    };
  };

  const disconnect = () => {
    if (stompClient.current) {
      if (stompClient.current.ws.readyState === WebSocket.OPEN) {
        stompClient.current.disconnect(() => {
          console.log("Disconnect");
        });
      }
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
        endGame(msg);
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
