import React, { useEffect, useContext, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import GameHeader from "@/components/GameHeader";
import MapComponent from "@/components/MapComponent";
import { GameContext } from "@/context/GameContext";

import useGameWebSocket from "@/hooks/WebSocket/useGameWebSocket";
import useStartGame from "@/hooks/Map/useStartGame";
import useSendGPS from "@/hooks/Map/useSendGPS";
import GameTime from "@/components/GameTime";
import useCatchTarget from "@/hooks/Map/useCatchTarget";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel.jsx";
import { Button } from "@/components/ui/Button";
import GameRuleDialog from "@/components/GameRuleDialog";

import catchButton from "@/assets/gameplay-icon/catch-button.png";
import camchattingIcon from "@assets/material-icon/camchatting-icon.svg";
import itemIcon from "@assets/material-icon/item-icon.svg";
import giveUpIcon from "@/assets/material-icon/giveup-icon.svg";

//====================================================================

import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";
import "../hooks/WebRTC/CamChatting.css";
import OvVideo from "@/hooks/WebRTC/OvVideo.jsx";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8080/";

const GamePlay = () => {
  //===========================   GPS   ============================
  const { gameStatus } = useContext(GameContext);
  const { fetch, timeUntilStart } = useStartGame();
  const { startSendingGPS } = useSendGPS();
  const { isAbleToCatchTarget, handleCatchTarget } = useCatchTarget();
  const { connect, disconnect } = useGameWebSocket();

  const [camChatting, setCamChatting] = useState(false); // camChatting 상태 초기화
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleCamChatting = () => {
    setCamChatting(prevState => !prevState); // camChatting 상태 토글 함수
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (gameStatus) {
      const stopSendingGPS = startSendingGPS();
      return () => stopSendingGPS(); // 컴포넌트 unmount 시 GPS 전송 중지
    }
  }, [gameStatus]);

  //===========================   OPENVIDU   ============================

  const [session, setSession] = useState(undefined); // 방 생성 관련
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);
  const audioEnabled = false;

  const username = localStorage.getItem("username"); // 추가
  const { gameRoomId: paramGameRoomId } = useParams(); // 추가

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

  const deleteSubscriber = streamManager => {
    setSubscribers(prevSubscribers =>
      prevSubscribers.filter(sub => sub !== streamManager)
    );
  };

  const joinSession = useCallback(async () => {
    const OV = new OpenVidu();

    console.log("joiSession");
    // 브라우저 감지 우회
    OV.isBrowserSupported = function () {
      return true; // 무조건 브라우저가 지원되는 것으로 간주
    };

    OV.checkSystemRequirements = function () {
      return true; // 시스템 요구사항을 무시하고 통과시키기
    };

    const newSession = OV.initSession();

    // 이벤트 리스너 중복 등록 방지를 위한 확인
    if (!session) {
      newSession.on("streamCreated", event => {
        const subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]);
        console.log("Updated subscribers: ", subscribers);
      });

      newSession.on("streamDestroyed", event => {
        deleteSubscriber(event.stream.streamManager);
      });

      newSession.on("exception", exception => {
        console.warn(exception);
      });

      setSession(newSession); // session 상태를 업데이트
    }

    const token = await getToken();

    try {
      await newSession.connect(token, { clientData: username });

      const newPublisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: false,
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

  // const leaveSession = useCallback(() => {
  //   if (session) {
  //       session.disconnect();
  //   }

  //   setSession(undefined);
  //   setSubscribers([]);
  //   setMainStreamManager(undefined);
  //   setPublisher(undefined);
  // }, [session, gameRoomId, username]);

  const switchCamera = useCallback(async () => {
    if (!currentVideoDevice || !session) return;

    try {
      const OV = new OpenVidu(); // switchCamera에서도 OV를 선언
      const devices = await OV.getDevices();
      const videoDevices = devices.filter(
        device => device.kind === "videoinput"
      );

      if (videoDevices.length > 1) {
        const newVideoDevice = videoDevices.find(
          device => device.deviceId !== currentVideoDevice.deviceId
        );

        if (newVideoDevice) {
          const newPublisher = OV.initPublisher(undefined, {
            videoSource: newVideoDevice.deviceId,
            publishAudio: true,
            publishVideo: true,
            mirror: true,
          });

          await session.unpublish(mainStreamManager);
          await session.publish(newPublisher);

          setCurrentVideoDevice(newVideoDevice);
          setMainStreamManager(newPublisher);
          setPublisher(newPublisher);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [session, mainStreamManager, currentVideoDevice]);

  const getToken = async () => {
    const sessionId = await createSession(paramGameRoomId);
    return await createToken(sessionId);
  };

  const createSession = async sessionId => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The sessionId
  };

  const createToken = async sessionId => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The token
  };

  return (
    <>
      {timeUntilStart > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-3xl text-white">
          게임 시작까지 {Math.max(0, Math.ceil(timeUntilStart / 1000))}초
          남았습니다.
        </div>
      )}

      <GameHeader />
      <div className="flex items-center justify-center">
        <div id="game-rule-dialog" className="m-4">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="shadow-3d h-14 w-32 bg-gradient-to-r from-teal-400 to-blue-700 font-bold"
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
      {camChatting ? (
        <>
          <div>
            {/* ==================   비디오 시작!  ===================*/}
            {session !== undefined ? (
              <div id="session">
                {/* <h1 id="session-title">{mySessionId}</h1> */}
                {/* <div style={{overflow: "hidden"}}> */}
                {mainStreamManager === undefined ? (
                  <div id="main-video" className="col-md-6">
                    <UserVideoComponent streamManager={mainStreamManager} />
                  </div>
                ) : null}
                {/* </div> */}
                {/* <div>
                  {publisher === undefined ? (
                    <div 
                      onClick={() => handleMainVideoStream(publisher)}
                    >
                      <UserVideoComponent streamManager={publisher} />
                    </div>
                  ) : null}
                </div> */}

                <Carousel opts={{ align: "start" }}>
                  <CarouselContent>
                    {subscribers.map((sub, index) => (
                      <CarouselItem
                        key={sub.id}
                        className="stream-container col-md-6 col-xs-6"
                      >
                        <div onClick={() => handleMainVideoStream(sub)}>
                          <span>{sub.id}</span>
                          <UserVideoComponent streamManager={sub} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="item-center flex-col justify-center">
          <MapComponent />
          <div className="item-center flex justify-center">
            <img
              src={catchButton}
              alt="catch-button"
              onClick={handleCatchTarget}
              className={`mr-2 w-60 ${isAbleToCatchTarget ? "" : "cursor-not-allowed opacity-40"}`}
            />
            <div id="mini-buttons" className="flex flex-col">
              <Button className="m-2 h-16 w-16 flex-col rounded-full border-black bg-white text-black">
                <img src={itemIcon} alt="item" className="opacity-70" />
                <div>item</div>
              </Button>
              <Button
                onClick={toggleCamChatting}
                className="m-2 h-16 w-16 flex-col rounded-full border-black bg-white text-black"
              >
                <img src={camchattingIcon} alt="chat" className="opacity-70" />
                <div>chat</div>
              </Button>
              <button
                className={`m-2 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 transition-colors duration-300`}
              >
                <img src={giveUpIcon} alt="Give Up" className="w-12" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GamePlay;
