import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

import axiosInstance from "@/api/axiosInstance";
import GameHeader from "@/components/GameHeader";
import MapComponent from "@/components/MapComponent";
import { GameContext } from "@/context/GameContext";

import useGameWebSocket from "@/hooks/WebSocket/useGameWebSocket";
import useStartGame from "@/hooks/Map/useStartGame";
import useSendGPS from "@/hooks/Map/useSendGPS";
import GameTime from "@/components/GameTime";
import useCatchTarget from "@/hooks/Map/useCatchTarget";
import useBullet from "@/hooks/Map/useBullet";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import GameRuleDialog from "@/components/GameRuleDialog";

import catchButton from "@/assets/gameplay-icon/catch-button.png";
import camchattingIcon from "@assets/material-icon/camchatting-icon.svg";
import itemIcon from "@assets/material-icon/item-icon.svg";
import giveUpIcon from "@/assets/material-icon/giveup-icon.svg";
import bulletImage from "@/assets/bullet.png";
import stealthCloakImage from "@/assets/gameplay-icon/stealth-cloak.png";
import jammingBombImage from "@/assets/gameplay-icon/jamming-bomb.png";
import enhancedBulletImage from "@/assets/gameplay-icon/enhanced-bullet.png";

// ===================================================================

import useItemCount from "@/hooks/Map/useItemCount";

//====================================================================

import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";
import "../hooks/WebRTC/CamChatting.css";
import OvVideo from "@/hooks/WebRTC/OvVideo.jsx";
import { BASE_URL, WS_BASE_URL } from "@/constants/baseURL";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? BASE_URL + "/cam/"
    : "http://localhost:8080/cam/";

let count = 1;
const GamePlay = () => {
  const {
    gameRoomId: gameId,
    isAlive,
    gameStatus,
    bullet,
    blockScreen,
    toOffChatting,
    blockGPSCount,
    blockScreenCount,
    enhancedBulletCount,
  } = useContext(GameContext);

  //===========================   ITEM   ============================

  const username = localStorage.getItem("username");
  const { useItem } = useItemCount();

  // // 테스트 데이터
  // const blockGPSCount = 1;
  // const blockScreenCount = 2;
  // const enhancedBulletCount = 3;

  const handleUseItem = async itemId => {
    // alert(`${itemId}번 아이템 사용`); // 테스트
    try {
      const response = await axiosInstance.post("/in-game/useItem", {
        username,
        gameId,
        itemId,
      });

      if (response.status == 200) {
        useItem(itemId);
        if (itemId == 3) {
          alert("강화 총알 효과가 30초간 적용됩니다!");
        }
      } else {
        alert("아이템 사용중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert(
        "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  //===========================   GPS   ============================

  const { fetch, timeUntilStart, checkItemEffect } = useStartGame();
  const { startSendingGPS } = useSendGPS();
  const { isAbleToCatchTarget, handleOnClickCatchTarget } = useCatchTarget();
  const { connect, disconnect } = useGameWebSocket();
  const { isCooldown, shootBullet } = useBullet();

  const [camChatting, setCamChatting] = useState(false);
  const [isItemClicked, setIsItemClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleCamChatting = () => {
    setCamChatting(prevState => !prevState);
  };

  const toggleItemList = () => {
    setIsItemClicked(prevState => !prevState);
  };

  useEffect(() => {
    connect();
    fetch();
    checkItemEffect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (gameStatus) {
      const stopSendingGPS = startSendingGPS();
      return () => stopSendingGPS(); // 컴포넌트 unmount 시 GPS 전송 중지
    }
  }, [gameStatus]);

  //===========================   OPENVIDU   ============================

  const [session, setSession] = useState(undefined); // 방 생성 관련
  const room = useRef(null);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);
  const audioEnabled = false;
  const ws = useRef(null);

  const navigate = useNavigate();
  const { gameRoomId: paramGameRoomId } = useParams(); // 추가
  const [userInvitationStatus, setUserInvitationStatus] = useState({});

  const privateRoom = useRef("");
  const fromUser = useRef("");
  const toUser = useRef("");

  useEffect(() => {}, [toUser, fromUser]);

  useEffect(() => {
    if (toOffChatting) {
      leaveSession();
    }
  }, [toOffChatting, session]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]);

  const handleMainVideoStream = stream => {
    if (mainStreamManager !== stream) {
      setMainStreamManager(stream);
    }
  };

  const handleButtonClick = async receiver => {
    const publisherName = publisher.stream.connection.data;
    const parsedData = JSON.parse(publisherName);
    const parsedPublisherName = parsedData.clientData;

    if (
      userInvitationStatus[username]?.isInviting ||
      userInvitationStatus[parsedPublisherName]?.isBeingInvited
    ) {
      alert(`다른 유저로부터 초대중입니다`);
      return;
    }

    // 사용자별 초대 상태 설정
    setUserInvitationStatus(prev => ({
      ...prev,
      [username]: { isInviting: true, isBeingInvited: false },
      [parsedPublisherName]: { isInviting: false, isBeingInvited: true },
    }));

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        const message = {
          type: "offer",
          fromUser: parsedPublisherName,
          toUser: receiver,
          curRoom: paramGameRoomId,
          privateRoom: "Room" + Math.floor(Math.random() * 100),
        };
        ws.current.send(`click:${JSON.stringify(message)}`);
      } catch (error) {
        console.error("Error creating or sending offer:", error);
      }
    } else {
      console.error("WebSocket is not open.");
    }
  };

  const handleAcceptClick = async () => {
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN) {
        try {
          const message = {
            type: "answer",
            fromUser: toUser.current,
            toUser: fromUser.current,
            curRoom: paramGameRoomId,
            privateRoom: privateRoom.current,
          };
          ws.current.send(`click:${JSON.stringify(message)}`);

          // 초대 상태 초기화
          setUserInvitationStatus(prev => ({
            ...prev,
            [toUser.current]: { isInviting: false, isBeingInvited: false },
            [fromUser.current]: { isInviting: false, isBeingInvited: false },
          }));
        } catch (error) {
          console.error("Error creating or sending answer:", error);
        }
      } else {
        console.error("WebSocket is not open.");
      }
    } else {
      console.error("WebSocket is not initialized.");
    }
    await leaveRoomAndNavigate();
  };

  const leaveSession = () => {
    if (room.data) {
      room.data.disconnect();
    }

    setSession(undefined);
    setSubscribers([]);
    setMainStreamManager(undefined);
    setPublisher(undefined);
  };

  const leaveRoomAndNavigate = async () => {
    leaveSession();
    navigate("/cam-chatting", {
      state: [
        {
          id: username,
          name: username,
          gameRoom: paramGameRoomId,
          camChatting: "privateRoomName",
        },
      ],
    });
  };

  const deleteSubscriber = streamManager => {
    setSubscribers(prevSubscribers =>
      prevSubscribers.filter(sub => sub !== streamManager)
    );
  };

  const joinSession = useCallback(async () => {
    const OV = new OpenVidu();

    OV.enableProdMode();

    OV.isBrowserSupported = function () {
      return true;
    };

    OV.checkSystemRequirements = function () {
      return true;
    };

    const newSession = OV.initSession();

    if (!session) {
      newSession.on("streamCreated", event => {
        const subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]);
      });

      newSession.on("streamDestroyed", event => {
        deleteSubscriber(event.stream.streamManager);
      });

      newSession.on("exception", exception => {
        console.warn(exception);
      });

      newSession.on("sessionDisconnected", async event => {});
      setSession(newSession);
      room.data = newSession;
    }

    const token = await getToken();

    try {
      await newSession.connect(token, { clientData: username });
      // 권한 요청 부분 추가
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioEnabled,
        }); // 권한 요청

        const newPublisher = await OV.initPublisherAsync(undefined, {
          audioSource: audioEnabled ? undefined : false,
          videoSource: undefined,
          publishAudio: audioEnabled,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        await newSession.publish(newPublisher);

        const devices = await OV.getDevices();
        const videoDevices = devices.filter(
          device => device.kind === "videoinput"
        );
        const currentVideoDeviceId = newPublisher.stream
          .getMediaStream()
          .getVideoTracks()[0]
          .getSettings().deviceId;
        const currentVideoDevice = videoDevices.find(
          device => device.deviceId === currentVideoDeviceId
        );

        setCurrentVideoDevice(currentVideoDevice);
        setMainStreamManager(newPublisher);
        setPublisher(newPublisher);

        //================== WebSocket 연결 설정 ==========================
        // ws.current = new WebSocket("ws://localhost:8080/ChattingServer");
        ws.current = new WebSocket(`${WS_BASE_URL}/ChattingServer`);
        ws.current.onopen = () => {
          const message = {
            username: username,
          };
          ws.current.send(`send:${JSON.stringify(message)}`);
        };

        ws.current.onmessage = event => {
          const messageString = event.data.replace("click:", "").trim();
          const message = JSON.parse(messageString);

          fromUser.current = message.fromUser;
          toUser.current = message.toUser;
          curRoom: paramGameRoomId, (privateRoom.current = message.privateRoom);

          console.log(message);
          if (message.type === "offer") {
            window.alert("1:1 채팅으로 초대되었습니다.");
            handleAcceptClick();
          } else if (message.type === "answer") {
            window.alert("초대에 응답했습니다");
            leaveRoomAndNavigate();
          } else if (message.type === "refuse") {
          }
        };

        ws.current.onclose = () => {
          console.log("WebSocket connection closed");
        };
        ws.current.onerror = error => {
          console.log("WebSocket error:", error);
          leaveSession();
        };
      } catch (permissionError) {
        console.error("Permission denied:", permissionError);
        alert(
          "카메라 및 마이크 권한이 필요합니다. 브라우저 설정에서 권한을 허용해 주세요."
        );
      }
    } catch (error) {
      console.log(
        "There was an error connecting to the session:",
        error.code,
        error.message
      );
    }
  }, [username, session, subscribers]);

  useEffect(() => {
    const initSession = async () => {
      if (!session) {
        await joinSession();
      }
    };
    initSession();
  }, []);

  const switchCamera = useCallback(async () => {
    if (!session || !publisher) return;

    try {
      // 우선 환경 설정으로 후방 카메라 시도 (environment)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });

      const newTrack = mediaStream.getVideoTracks()[0];

      await publisher.replaceTrack(newTrack);
      console.log("New track has been published using facingMode: environment");
    } catch (error) {
      console.warn(
        "facingMode: 'environment' failed, trying with deviceId",
        error
      );

      // facingMode가 실패할 경우, deviceId 방식으로 시도
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          device => device.kind === "videoinput"
        );

        const rearCamera = videoDevices.find(
          device =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("환경") ||
            device.label.toLowerCase().includes("후면")
        );

        const selectedDeviceId = rearCamera
          ? rearCamera.deviceId
          : videoDevices[0].deviceId;

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
          audio: false,
        });

        const newTrack = mediaStream.getVideoTracks()[0];
        await publisher.replaceTrack(newTrack);
        console.log("New track has been published using deviceId");
      } catch (fallbackError) {
        console.error(
          "Error switching camera with both facingMode and deviceId",
          fallbackError
        );
      }
    }
  }, [session, publisher]);

  const getToken = async () => {
    const sessionId = await createSession(paramGameRoomId);
    return await createToken(sessionId);
  };

  const createSession = async sessionId => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The sessionId
  };

  const createToken = async sessionId => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The token
  };

  // ===== JSX 시작 ===========================================================================================================================================

  return (
    <>
      {/*timeUntilStart > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 text-center text-3xl leading-relaxed text-white">
          게임 시작까지
          <div className="text-rose-500">
            {Math.max(0, Math.ceil(timeUntilStart / 1000))} 초
          </div>
          남았습니다 <span className="h-16 w-16 animate-spin">🕛</span>
        </div>
      )*/}

      {/* blockScreen 아이템 화면 오버레이 부분 */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 text-center text-3xl leading-relaxed ${blockScreen ? "visible" : "hidden"}`}
      >
        내 타겟이 나에게
        <div>
          <span className="text-rose-500">방해 폭탄</span>을 쐈습니다 !
        </div>
        <br />
        <div>화면을 30초 동안</div>
        사용할 수 없습니다
        <span className="h-12 w-16 animate-spin">😵</span>
      </div>

      {/* publisher 의 카메라 인자 전달 */}
      <GameHeader
        switchCamera={switchCamera}
        publisher={publisher}
        handleMainVideoStream={handleMainVideoStream}
      />

      <div className="m-2 flex items-center justify-around">
        <div id="game-rule-dialog">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-[6vh] w-32 bg-gradient-to-r from-teal-400 to-blue-700 font-bold shadow-3d"
          >
            게임 규칙
          </Button>
          <GameRuleDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
        </div>
        <GameTime />
      </div>

      {/* 아래는 camChatting 상태에 따라 달라질 부분 (지도 <-> 화상)  */}

      {!camChatting ? (
        <>
          <MapComponent />
          <div className="item-center flex justify-center">
            <div
              className={`relative mr-4 h-[28vh] w-[28vh] overflow-hidden ${bullet > 0 && !isCooldown && isAbleToCatchTarget ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
            >
              <img
                src={catchButton}
                alt="catch-button"
                onClick={() => {
                  shootBullet();
                  handleOnClickCatchTarget();
                }}
                className="absolute z-20 mr-4 h-[28vh] w-[28vh]"
              />
              <div className="absolute bottom-4 left-4 z-30 flex h-12 w-20 items-center justify-center rounded-xl bg-sky-100">
                <img src={bulletImage} alt="bullet" className="mr-2 h-8 w-8" />
                <span className="text-3xl font-bold text-black">{bullet}</span>
              </div>
              {bullet > 0 && !isCooldown && isAbleToCatchTarget && (
                <div
                  id="catch-pulse"
                  className="absolute bottom-[3vh] left-[3vh] z-10 h-[21vh] w-[21vh] animate-ping rounded-full bg-amber-200"
                />
              )}
            </div>

            <div id="mini-buttons" className="flex flex-col">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    onClick={toggleItemList}
                    className={`m-2 h-[7vh] w-[7vh] flex-col rounded-full border-black bg-gradient-to-r from-lime-200 to-teal-400 text-black ${isAlive ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
                  >
                    <img src={itemIcon} alt="item" />
                    <div className="text-xs">아이템</div>
                  </Button>
                </DropdownMenuTrigger>
                {isItemClicked && (
                  <DropdownMenuContent
                    side="left"
                    className="mr-1 mt-12 h-28 w-60 rounded-2xl bg-white"
                  >
                    <div className="flex flex-row">
                      <DropdownMenuItem
                        onClick={() => handleUseItem(1)}
                        className={`relative flex flex-col ${blockGPSCount > 0 ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
                      >
                        <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-rose-500 text-center font-semibold text-white">
                          {blockGPSCount}
                        </div>
                        <img
                          src={stealthCloakImage}
                          className="m-1 h-14 w-14"
                        />
                        <div className="text-xs font-bold">스텔스 망토</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUseItem(2)}
                        className={`relative flex flex-col ${blockScreenCount > 0 ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
                      >
                        <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-rose-500 text-center font-semibold text-white">
                          {blockScreenCount}
                        </div>
                        <img src={jammingBombImage} className="m-1 h-14 w-14" />
                        <div className="text-xs font-bold">방해 폭탄</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUseItem(3)}
                        className={`relative flex flex-col ${enhancedBulletCount > 0 ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
                      >
                        <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-rose-500 text-center font-semibold text-white">
                          {enhancedBulletCount}
                        </div>
                        <img
                          src={enhancedBulletImage}
                          className="m-1 h-14 w-14"
                        />
                        <div className="text-xs font-bold">강화 총알</div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
              <Button
                onClick={toggleCamChatting}
                className="m-2 h-[7vh] w-[7vh] flex-col rounded-full border-black bg-gradient-to-r from-cyan-200 to-indigo-400 text-black"
              >
                <img src={camchattingIcon} alt="chat" />
                <div className="text-xs">화상채팅</div>
              </Button>
              <Button
                className={`m-2 flex h-[7vh] w-[7vh] items-center justify-center rounded-full bg-rose-500 transition-colors duration-300`}
              >
                <img src={giveUpIcon} alt="Give Up" className="w-12" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative h-[45vh] w-full">
            <Button
              onClick={() => setCamChatting(false)}
              className="border-1 absolute right-[3%] top-[3%] z-20 h-12 w-20 rounded-lg border-black bg-gradient-to-r from-emerald-300 to-emerald-500 font-bold text-white shadow-3d"
            >
              ← 지도
            </Button>
            {/* ==================   비디오 시작!  ===================*/}
            {session !== undefined ? (
              <div>
                {/* <h1 id="session-title">{mySessionId}</h1> */}
                {/* <div style={{overflow: "hidden"}}> */}
                {mainStreamManager === undefined ? (
                  <div id="main-video">
                    <UserVideoComponent streamManager={mainStreamManager} />
                  </div>
                ) : null}
                {/* </div> 
                <div>
                  {publisher === undefined ? (
                    <div 
                      onClick={() => handleMainVideoStream(publisher)}
                    >
                      <UserVideoComponent streamManager={publisher} />
                    </div>
                  ) : null}
                </div>
                */}

                <Carousel opts={{ align: "start" }}>
                  <CarouselContent>
                    {subscribers
                      .filter(sub => sub !== publisher) // publisher와 동일한 객체 필터링
                      .map((sub, index) => (
                        <CarouselItem key={index} className="stream-container">
                          <UserVideoComponent
                            streamManager={sub}
                            currentUserNickname={username} // username 전달
                          />
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                </Carousel>
                <div className="m-4">
                  {subscribers.map((subscriber, idx) => {
                    const clientData = JSON.parse(
                      subscriber.stream.connection.data
                    ).clientData;
                    return (
                      // <Button key={idx} onClick={handleButtonClick}>
                      //   {clientData}
                      // </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          key={idx}
                          onClick={() => handleButtonClick(clientData)}
                          className="bg-gradient-to-r from-purple-600 to-teal-300 p-2"
                        >
                          {clientData}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
};

export default GamePlay;
