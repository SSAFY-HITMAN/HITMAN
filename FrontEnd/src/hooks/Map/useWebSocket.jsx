import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// game start/end, 게임 영역 축소 신호만 수신/처리
const useWebSocket = () => {
  const stompClient = useRef(null);
  const {
    gameRoomId,
    targetId,
    setGameStatus,
    setAreaCenter,
    areaRadius,
    setAreaRadius,
  } = useContext(GameContext);

  useEffect(() => {
    if (!gameRoomId || !setGameStatus) return;

    const socket = new SockJS("/server");
    stompClient.current = Stomp.over(socket);
    stompClient.current.connect({}, frame => {
      console.log("Connected: " + frame);

      stompClient.current.subscribe(`/topic/alert/${gameRoomId}`, serverMsg => {
        const msg = JSON.parse(serverMsg.body);
        handleAlertMessage(msg);
      });

      // useFirebase.jsx로 기능 이관
      // if (targetId) {
      //   stompClient.current.subscribe(
      //     `/topic/location/${targetId}`,
      //     serverMsg => {
      //       const targetLocation = JSON.parse(serverMsg.body);
      //       setTargetLocation({
      //         lat: targetLocation.lat,
      //         lng: targetLocation.lng,
      //       });
      //     }
      //   );
      // }
    });

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, []);

  const handleAlertMessage = msg => {
    // msgType 따라 로직 분기
    const { msgType, alertDegree } = msg;
    switch (msgType) {
      case "start":
        setGameStatus(true);
        break;
      case "alert":
        handleAlertDegree(alertDegree);
        break;
      case "end":
        setGameStatus(false);
        break;
      default:
        break;
    }
  };

  const handleAlertDegree = degree => {
    // 반경 변동 로직
    switch (degree) {
      case 1:
        console.log("25% 경과");
        setAreaRadius(areaRadius * 0.75); // 임의로 설정
        break;
      case 2:
        console.log("50% 경과");
        setAreaRadius(areaRadius * 0.75);
        break;
      case 3:
        console.log("75% 경과");
        setAreaRadius(areaRadius * 0.75);
        break;
      case 4:
        setGameStatus(false);
        break;
      default:
        break;
    }
  };

  // useFirebase.jsx로 기능 이관
  // const sendLocation = location => {
  //   if (stompClient.current) {
  //     stompClient.current.send("/pub/location", {}, JSON.stringify(location));
  //   }
  // };

  // return { sendLocation };
};

export default useWebSocket;
