import React, {
  createContext,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axiosInstance from "@/api/axiosInstance.js";
import useEndGame from "@/hooks/Map/useEndGame";
import { GameContext } from "@/context/GameContext";
import { BASE_URL } from "@/constants/baseURL";

// WebSocket은 게임 방 접속시부터 실행되어야 함
// 게임 내(gameStatus===true)에서 WebSocket은 게임 상태(start-true, end-false), 영역 축소 신호만 수신 및 처리
export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const {
    username,
    gameRoomId,
    setGameRoomUsers,
    setGameStatus,
    setIsAlive,
    targetId,
    setTargetId,
    areaCenter,
    setAreaCenter,
    areaRadius,
    setAreaRadius,
    setMissionList,
  } = useContext(GameContext);
  const stompClient = useRef(null);

  // connect, disconnect 함수 정의
  const connect = useCallback(() => {
    if (!gameRoomId) return;

    const socket = new SockJS(`${BASE_URL}/gameRoom/${gameRoomId}`);
    stompClient.current = Stomp.over(socket);

    const username = localStorage.getItem("username");
    stompClient.current.connect({ username: username }, frame => {
      console.log("Connected: " + frame);

      stompClient.current.subscribe(`/topic/room/${gameRoomId}`, serverMsg => {
        const msg = JSON.parse(serverMsg.body);
        handleAlertMessage(msg);
      });
    });
  }, [gameRoomId]);

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.disconnect();
      console.log("Disconnected");
    }
  }, []);

  const handleAlertMessage = msg => {
    switch (msg.msgType) {
      case "start":
        setGameStatus(true);
        setIsAlive(true);
        sessionStorage.setItem("gameStatus", true);
        sessionStorage.setItem("isAlive", true);
        // gameStatus가 true로 변동 시, Room.jsx에서 GamePlay.jsx로 navigate
        break;
      case "alert":
        handleAlertDegree(msg.alertDegree);
        break;
      case "end":
        setGameStatus(false);
        useEndGame();
        break;
      case "ready":
        // IIFE(즉시 실행 함수 표현): 함수를 정의하고 즉시 실행하는 방법
        (async () => {
          try {
            const response = await axiosInstance.get(
              `/gameroom/${gameRoomId}/startInfo`
            );
            if (response.status == 200) {
              // 반경, 중심, 타겟 닉네임 수신
              const newAreaRadius = parseInt(response.data.mapSize, 10);
              const newAreaCenter = {
                lat: parseFloat(response.data.centerLat).toFixed(5),
                lng: parseFloat(response.data.centerLng).toFixed(5),
              };
              const newTargetId = response.data.targetName;

              // 상태 업데이트
              setAreaRadius(newAreaRadius);
              setAreaCenter(newAreaCenter);
              setTargetId(newTargetId);

              sessionStorage.setItem("areaRadius", newAreaRadius); // handleAlertDegree에서 별도 관리
              sessionStorage.setItem("areaCenter", newAreaCenter); // 게임 종료 시까지 불변
              sessionStorage.setItem("targetId", newTargetId); // "target" msgType에서 관리

              // 이하는 sessionStorage를 통해 PlotGameTime.jsx에서만 사용되는 부분
              const newGamePlayTime = parseInt(response.data.time, 10); // 분 단위
              const newStartTime = response.data.startTime;
              sessionStorage.setItem(
                "gamePlayTime",
                newGamePlayTime.toString()
              );
              sessionStorage.setItem("startTime", newStartTime);
            } else {
              alert("게임 시작 관련 정보를 가져오는 중 오류가 발생했습니다.");
            }
          } catch (err) {
            alert(
              "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
            );
          }

          // 초기 미션 지급
          try {
            const response = await axiosInstance.get(
              `/in-game/${gameRoomId}/assignMissions`
            );
            if (response.status == 200) {
              setMissionList(response.data);
              sessionStorage.setItem("missionList", response.data);
            } else {
              alert("할당된 미션 수신 과정에서 오류가 발생했습니다.");
            }
          } catch (err) {
            alert(
              "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
            );
          }
        })();
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
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{ connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
