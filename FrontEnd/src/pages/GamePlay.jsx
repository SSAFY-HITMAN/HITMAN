import React, { useEffect, useContext, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

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
import { Button } from "@/components/ui/Button";
import GameRuleDialog from "@/components/GameRuleDialog";

import catchButton from "@/assets/gameplay-icon/catch-button.png";
import camchattingIcon from "@assets/material-icon/camchatting-icon.svg";
import itemIcon from "@assets/material-icon/item-icon.svg";
import giveUpIcon from "@/assets/material-icon/giveup-icon.svg";
import bulletImage from "@/assets/bullet.png";

//====================================================================

import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";
import "../hooks/WebRTC/CamChatting.css";
import OvVideo from "@/hooks/WebRTC/OvVideo.jsx";
import { BASE_URL } from "@/constants/baseURL";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? BASE_URL : "http://localhost:8080/";

let count = 1;
const GamePlay = () => {
  //===========================   GPS   ============================
  const { gameStatus, blockScreen, toOffChatting } = useContext(GameContext);
  const { fetch, timeUntilStart, checkItemEffect } = useStartGame();
  const { startSendingGPS } = useSendGPS();
  const { isAbleToCatchTarget, handleOnClickCatchTarget } = useCatchTarget();
  const { connect, disconnect } = useGameWebSocket();
  const { bullet, isCooldown, shootBullet } = useBullet();

  const [camChatting, setCamChatting] = useState(false); // camChatting 상태 초기화
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleCamChatting = () => {
    setCamChatting(prevState => !prevState); // camChatting 상태 토글 함수
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
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);
  const audioEnabled = false;

  const ws = useRef(null)
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
    console.log("current main stream manager ", mainStreamManager);
    if (mainStreamManager !== stream) {
      setMainStreamManager(stream);
      console.log("=====> publisher : ", publisher);
      console.log("====> subscribers : ", subscribers);
    }
  };

  const handleButtonClick = async (receiver) => {
    console.log(receiver);
    console.log(ws.current);  

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {

        const message = {
          type: 'offer',
          fromUser: participantName,
          toUser: receiver,
          curRoom: roomName,
          privateRoom: 'Room' + Math.floor(Math.random() * 100)
        };
        ws.current.send(`click:${JSON.stringify(message)}`);
        console.log('Sent offer:', message);
      } catch (error) {
        console.error('Error creating or sending offer:', error);
      }
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
    }
    session(undefined);
    setSubscribers([]);
    setMainStreamManager(undefined);
    setPublisher(undefined);
  };

  const deleteSubscriber = streamManager => {
    setSubscribers(prevSubscribers =>
      prevSubscribers.filter(sub => sub !== streamManager)
    );
  };

  const joinSession = useCallback(async () => {
    const OV = new OpenVidu();

    OV.enableProdMode();

    console.log("joiSession");
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
        console.log("Updated subscribers: ", subscribers);
      });

      newSession.on("streamDestroyed", event => {
        deleteSubscriber(event.stream.streamManager);
      });

      newSession.on("exception", exception => {
        console.warn(exception);
        console.log("===============WARN!!!=============");
      });

      newSession.on("sessionDisconnected", async event => {
        console.log("=====> sessionDisconnected! ");
      });

      setSession(newSession);
    }

    const token = await getToken();

    try {
      await newSession.connect(token, { clientData: username });
      console.log("connectToken");
      // 권한 요청 부분 추가
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioEnabled,
        }); // 권한 요청
        console.log("Permissions granted!");

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

        // WebSocket 연결 설정
        ws.current = new WebSocket('ws://localhost:8080/ChattingServer');
        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
        };
        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };
        ws.current.onerror = (error) => {
            console.log('WebSocket error:', error);
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

  return (
    <>
      {timeUntilStart > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-3xl text-white">
          게임 시작까지
          <br /> {Math.max(0, Math.ceil(timeUntilStart / 1000))}초<br />
          남았습니다.
        </div>
      )}

      {/* blockScreen 아이템 화면 오버레이 부분 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-3xl text-white ${blockScreen ? "visible" : "hidden"}`}
      >
        방해 폭탄을
        <br />
        맞았습니다!
      </div>

      {/* publisher 의 카메라 인자 전달 */}
      <GameHeader
        publisher={publisher}
        handleMainVideoStream={handleMainVideoStream}
      />

      <div className="flex items-center justify-center">
        <div id="game-rule-dialog" className="m-4">
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
              className={`relative mr-4 h-[28vh] w-[28vh] overflow-hidden ${bullet && !isCooldown && isAbleToCatchTarget ? "" : "pointer-events-none cursor-not-allowed opacity-30"}`}
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
              <Button className="m-2 h-[7vh] w-[7vh] flex-col rounded-full border-black bg-gradient-to-r from-lime-200 to-teal-400 text-black">
                <img src={itemIcon} alt="item" />
                <div className="text-xs">아이템</div>
              </Button>
              <Button
                onClick={toggleCamChatting}
                className="m-2 h-[7vh] w-[7vh] flex-col rounded-full border-black bg-gradient-to-r from-cyan-200 to-indigo-400 text-black"
              >
                <img src={camchattingIcon} alt="chat" />
                <div className="text-xs">화상채팅</div>
              </Button>
              <button
                className={`m-2 flex h-[7vh] w-[7vh] items-center justify-center rounded-full bg-rose-500 transition-colors duration-300`}
              >
                <img src={giveUpIcon} alt="Give Up" className="w-12" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative h-[45vh] w-full rounded-lg bg-white">
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
                        <CarouselItem key={sub.id} className="stream-container">
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
                      <div className="flex justify-center">
                        <Button 
                          key={idx}
                          onClick={handleButtonClick} 
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
