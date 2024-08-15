import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import { useLocation, useNavigate } from "react-router-dom";
import UserVideoComponent from '@/hooks/WebRTC/UserVideoComponent'; // 수정된 경로
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '../components/ui/Carousel.jsx';
import { BASE_URL } from '@/constants/baseURL.js';

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? BASE_URL + "/cam/"
    : "http://localhost:8080/cam/";

const CamChatting = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [mySessionId, setMySessionId] = useState('');
    const [myUserName, setMyUserName] = useState('');
    const [session, setSession] = useState(undefined);
    const [mainStreamManager, setMainStreamManager] = useState(undefined);
    const [publisher, setPublisher] = useState(undefined);
    const [subscribers, setSubscribers] = useState([]);
    const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);
    const initializedRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState(20);  // 남은 시간을 상태로 관리

    const room = useRef(null);
    const timeoutRef = useRef(null);  // 타이머를 저장하는 ref
    const intervalRef = useRef(null);  // 시간 업데이트 인터벌을 저장하는 ref

    useEffect(() => {
        if (initializedRef.current) return;

        if (location.state) {
            const { name, camChatting } = location.state[0]; // 첫 번째 유저 정보 가져오기
            setMySessionId(camChatting);
            setMyUserName(name);

            joinSession(camChatting, name); // 자동으로 세션에 입장
            initializedRef.current = true;

            // 30초 후에 자동으로 나가기 설정
            timeoutRef.current = setTimeout(() => {
                leaveRoomAndNavigate();  // 30초 후에 나가게 하는 함수 호출
            }, 20000);  // 20,000ms = 20초

            intervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => {
            // 컴포넌트 언마운트 시 타이머와 인터벌을 정리
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [location.state]);

    const handleMainVideoStream = (stream) => {
        if (mainStreamManager !== stream) {
            setMainStreamManager(stream);
        }
    };

    const deleteSubscriber = (streamManager) => {
        setSubscribers((prevSubscribers) => prevSubscribers.filter((sub) => sub !== streamManager));
    };

    const joinSession = useCallback(async (sessionId, userName) => {

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
                setSubscribers(prevSubscribers => [...prevSubscribers,    subscriber]);
            });
      
            newSession.on("streamDestroyed", event => {
                deleteSubscriber(event.stream.streamManager);
            });
      
            newSession.on("exception", exception => {
                console.warn(exception);
            });
      
            newSession.on("sessionDisconnected", async event => {
                console.log("=====> sessionDisconnected! ");
            });
      
            setSession(newSession);
            room.data = newSession;
        }

        const token = await getToken(sessionId);

        newSession.connect(token, { clientData: userName })
            .then(async () => {
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

                newSession.publish(newPublisher);

                const devices = await OV.getDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                const currentVideoDeviceId = newPublisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
                const currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

                setCurrentVideoDevice(currentVideoDevice);
                setMainStreamManager(newPublisher);
                setPublisher(newPublisher);
                setSession(newSession);
            })
            .catch((error) => {
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
    }, []);

    const leaveSession = () => {
        if(room.data){
          room.data.disconnect();
        }
        
        setSession(undefined);
        setSubscribers([]);
        setMainStreamManager(undefined);
        setPublisher(undefined);
      };

    const leaveRoomAndNavigate = async () => {
        leaveSession();
        navigate("/game-play/" + location.state[0].gameRoom, { 
            state: [{
                id: location.state[0].name,
                name: location.state[0].name,
                camChatting: location.state[0].camChatting,
            }],
        });
    }

    const getToken = async (sessionId) => {
        const sessionIdResponse = await createSession(sessionId);
        return await createToken(sessionIdResponse);
    };

    const createSession = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    };

    const createToken = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    };

    return (
        <div>
            <div id="session">
                <div id="session-header">
                    <input
                        className="btn btn-large btn-danger"
                        type="button"
                        id="buttonLeaveSession"
                        onClick={leaveRoomAndNavigate}
                        value="방 떠나기"
                    />
                    {/* 남은 시간 표시 */}
                    <div>
                        <p>남은 시간: {timeLeft}초</p>
                    </div>
                </div>
    
                {mainStreamManager ? (
                    <div id="main-video" className="col-md-6">
                        <UserVideoComponent streamManager={mainStreamManager} />
                    </div>
                ) : null}
    
                <div>
                    <Carousel opts={{ align : "start" }}>
                        <CarouselContent>
                            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                                {subscribers.map((sub, i) => (
                                    <div 
                                        key={sub.id} 
                                        onClick={() => handleMainVideoStream(sub)}
                                    >
                                        <CarouselItem key={`${sub}-${i}`}>
                                            <span>{sub.id}</span>
                                            <UserVideoComponent streamManager={sub} />
                                        </CarouselItem>
                                    </div>
                                ))}
                            </div>
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default CamChatting;
