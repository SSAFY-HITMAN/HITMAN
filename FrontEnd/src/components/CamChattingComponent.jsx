import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";
import "../hooks/WebRTC/CamChatting.css";
import OvVideo from "@/hooks/WebRTC/OvVideo.jsx";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel.jsx';

const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://demos.openvidu.io/';

const CamChattingComponent = ({gameRoomId, username}) => {
  const mySessionId = gameRoomId;
  const myUserName = username;
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);

  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  // const handleChangeSessionId = (e) => {
  //     setMySessionId(e.target.value);
  // };

  // const handleChangeUserName = (e) => {
  //     setMyUserName(e.target.value);
  // };

  const handleMainVideoStream = (stream) => {
      if (mainStreamManager !== stream) {
          setMainStreamManager(stream);
      }
  };

  const deleteSubscriber = (streamManager) => {
      setSubscribers((prevSubscribers) => prevSubscribers.filter(sub => sub !== streamManager));
  };

  const joinSession = useCallback(async () => {
    const OV = new OpenVidu();

    console.log("joiSession")
    // 브라우저 감지 우회
    OV.isBrowserSupported = function() {
        return true; // 무조건 브라우저가 지원되는 것으로 간주
    };

    OV.checkSystemRequirements = function() {
        return true; // 시스템 요구사항을 무시하고 통과시키기
    };

    const newSession = OV.initSession();

    // 이벤트 리스너 중복 등록 방지를 위한 확인
    if (!session) {
      newSession.on('streamCreated', (event) => {
        const subscriber = newSession.subscribe(event.stream, undefined);
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
        console.log("Updated subscribers: ", subscribers);
      });

      newSession.on('streamDestroyed', (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      newSession.on('exception', (exception) => {
        console.warn(exception);
      });

      setSession(newSession); // session 상태를 업데이트
    }

    const token = await getToken();

    try {
      await newSession.connect(token, { clientData: myUserName });

      const newPublisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
      });

      await newSession.publish(newPublisher);

      const devices = await OV.getDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const currentVideoDeviceId = newPublisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
      const currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

      setCurrentVideoDevice(currentVideoDevice);
      setMainStreamManager(newPublisher);
      setPublisher(newPublisher);

    } catch (error) {
      console.log('There was an error connecting to the session:', error.code, error.message);
    }
  }, [myUserName, session, subscribers]);

  

  // 추가한 부분 -> 자동 입장
  useEffect(() => {
    const initSession = async () => {
      if (!session) {
        await joinSession();
      }
    }
    initSession();
  }, []);


  const leaveSession = useCallback(() => {
    if (session) {
        session.disconnect();
    }

    setSession(undefined);
    setSubscribers([]);
    setMySessionId('SessionA');
    setMyUserName('Participant' + Math.floor(Math.random() * 100));
    setMainStreamManager(undefined);
    setPublisher(undefined);
  }, [session, gameRoomId, username]);

  const switchCamera = useCallback(async () => {
    if (!currentVideoDevice || !session) return;

    try {
      const OV = new OpenVidu(); // switchCamera에서도 OV를 선언
      const devices = await OV.getDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length > 1) {
        const newVideoDevice = videoDevices.find(device => device.deviceId !== currentVideoDevice.deviceId);

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
    const sessionId = await createSession(mySessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data; // The sessionId
  };

  const createToken = async (sessionId) => {
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data; // The token
  };


  return (
    <div>

      {session !== undefined ? (
        <div id="session">            
          <h1 id="session-title">{mySessionId}</h1>

          {mainStreamManager === undefined ? (
            <div id="main-video" className="col-md-6">
              <UserVideoComponent streamManager={mainStreamManager} />
            </div>
          ) : null}

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
                <CarouselItem key={sub.id} className="stream-container col-md-6 col-xs-6">
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
  );
};

export default CamChattingComponent;
