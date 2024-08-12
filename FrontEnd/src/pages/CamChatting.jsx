import React, { useEffect, useState, useRef } from 'react';
import {
  LocalVideoTrack,
  RemoteParticipant,
  Room,
  RoomEvent,
  DataPacket_Kind 
} from 'livekit-client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import '../hooks/WebRTC/CamChatting.css';
import VideoComponent from '../hooks/WebRTC/VideoComponent.jsx';
import AudioComponent from '../hooks/WebRTC/AudioComponent.jsx';
import { compact } from 'lodash';

// 로컬 환경에서는 아래 변수들을 빈 값으로 남겨두기 
// ==> 배포할 때, 아래의 변수들을 조건에 맞게 정확한 url을 다시 setting할 것 
// ====> 변수 수정 : LIVEKIT_URL -> OPENVIDU_URL
let APPLICATION_SERVER_URL = '';
let OPENVIDU_URL = '';

configureUrls();

function configureUrls() {
  const hostname = window.location.hostname;
  
  // APPLICATION_SERVER_URL 이 설정되지 않으면, 로컬 값을 디폴트로 사용 
  if (!APPLICATION_SERVER_URL) {
    if (hostname === 'localhost') {
      APPLICATION_SERVER_URL = 'http://localhost:6080/';
      OPENVIDU_URL = 'ws://localhost:7880/';
    } else {
      APPLICATION_SERVER_URL = `https://${hostname}:6443/`;
      OPENVIDU_URL = `wss://${hostname}:7443/`;
    }
  }
}

const CamChatting = () => {
  const [room, setRoom] = useState(undefined);                          // 방 생성 시 사용
  const [localVideoTrack, setLocalVideoTrack] = useState(undefined);    // 화상 채팅 때 사용하는 비디오 변수 
  const [localAudioTrack, setLocalAudioTrack] = useState(undefined);    // 음소거 관련
  const [remoteTracks, setRemoteTracks] = useState([]);                 // 본인을 제외한 참여자 
  const [participants, setParticipants] = useState([]);                 // 1:1 방 이동을 위한 변수 
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);           // 음소거 관련 boolean 
  const [participantName, setParticipantName] = useState('Participant' + Math.floor(Math.random() * 100));    // 임시 참가 유저명 생성 
  const [roomName, setRoomName] = useState('Test Room');                // 방 이름 초깃값 
  const [newRoomName, setNewRoomName] = useState('Room' + Math.floor(Math.random() * 100));   // 1:1 로 이동할 새로운 방 임시 명 

  const webSocket = useRef(null);   // 웹소켓
  const [messages, setMessages] = useState([]);

  const [recipient, setRecipient] = useState(undefined);

  const peerConnection = useRef(null);
  const remoteStream = useRef(new MediaStream());


  // useEffect로 함수와 변수를 관리하기가 더 효율적인 것 같아서 수정 
  useEffect(() => {
    if (room) {
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

      return () => {
        room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      };
    }
  }, [room]);


  // 웹소켓용 useEffect
  useEffect(() => {

    if (webSocket.current) {
      // Close any existing WebSocket connection before creating a new one
      webSocket.current.close();
    }

    // Construct WebSocket URL from APPLICATION_SERVER_URL
    // const webSocketUrl = `${APPLICATION_SERVER_URL.replace('http', 'ws').replace('https', 'wss')}ChattingServer`; // Adjust path if necessary

    // Create WebSocket connection
   const ws = new WebSocket('ws://localhost:6080/ChattingServer');
    webSocket.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
    };

    // ws.onerror = (error) => {
    //   console.error('WebSocket error:', error);
    // };

    ws.onmessage = async (event) => {
      let signalData;
      let jsonPayload;
      let fromUser;
      let toUser;
      console.log('Received message:', event.data);
      const parts = event.data.match(/^(click):(\{.*\}):([^:]*):([^:]*)$/);
      
      if (parts && parts.length === 5) {
        signalData = parts[1].trim();
        jsonPayload = parts[2].trim();
        fromUser = parts[3].trim();
        toUser = parts[4].trim();
        // const [signalData, toUser, fromUser] = event.data.split(":");

        console.log(`toUser: ${toUser}`);
        console.log(`fromUser: ${fromUser}`);
        console.log(`signalData: ${signalData}`);
        console.log(`jsonPayload: ${jsonPayload}`);
      }
      
      if (toUser === participantName) {
        const signal = JSON.parse(jsonPayload);
        if (signal.type === "offer") {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          ws.send(`click:${JSON.stringify(answer)}:${fromUser}:${participantName}`);
        } else if (signal.type === "answer") {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.type === "ice-candidate") {
          const candidate = new RTCIceCandidate(signal);
          await peerConnection.current.addIceCandidate(candidate);
        }
      }
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log('WebSocket connection closed.');
      }
    };
  }, [participantName]);


  const handleParticipantConnected = (participant) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const handleParticipantDisconnected = (participant) => {
    setParticipants((prev) => prev.filter((p) => p.identity !== participant.identity));
  };

  

  async function joinRoom() {
    const room = new Room();
    setRoom(room);

    room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
      setRemoteTracks((prev) => [
        ...prev,
        {
          trackPublication: publication,
          participantIdentity: participant.identity,
        },
      ]);
    });

    room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks((prev) =>
        prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid)
      );
    });

    try {
      const token = await getToken(roomName, participantName);
      await room.connect(OPENVIDU_URL, token);
      await room.localParticipant.enableCameraAndMicrophone();

      // 초기 음소거 셋팅
      room.localParticipant.setMicrophoneEnabled(false);
      setIsAudioEnabled(false);

      const videoTrack = room.localParticipant.videoTrackPublications.values().next().value.track;
      const audioTrack = room.localParticipant.audioTrackPublications.values().next().value.track;

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

    } catch (error) {
      console.log('There was an error connecting to the room:', error.message);
      await leaveRoom();
    }
  }

  async function leaveRoom() {
    await room?.disconnect();
    setRoom(undefined);
    setLocalVideoTrack(undefined);
    setLocalAudioTrack(undefined);
    setRemoteTracks([]);
    setParticipants([]);
    if (webSocket.current) {
      webSocket.current.close();
      console.log('WebSocket connection closed.');
    }
  }

  // 방 시작하마자 받는 개인 별로 받는 토큰 
  async function getToken(roomName, participantName) {
    const response = await fetch(`${APPLICATION_SERVER_URL}token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: roomName,
        participantName: participantName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get token: ${error.errorMessage}`);
    }

    const data = await response.json();
    return data.token;
  }


  // Mute 기능 : 하!지!만 로컬 이외의 환경에서는 음소가 on/off가 안되고 처음부터 쪽 음소거모드 
  // ==== 수정 필요 ==== 
  const toggleAudio = () => {
    if (room) {
      const isCurrentlyEnabled = room.localParticipant.isMicrophoneEnabled;
      console.log(`isCurrentlyEnabled: ${isCurrentlyEnabled}`)
      room.localParticipant.setMicrophoneEnabled(!isCurrentlyEnabled);
      setIsAudioEnabled(!isCurrentlyEnabled);
    }
  };


  useEffect(() => {
    // This will run every time `recipient` changes
    if (recipient !== undefined) {
      console.log(`Updated recipient: ${recipient}`);
    }
  }, [recipient]);


  const handleButtonClick = async (participantIdentity) => {
    console.log(participantIdentity);
    console.log(webSocket.current);  // Use webSocket.current to access the WebSocket instance
    
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      setRecipient(participantIdentity);
      const offer = await peerConnection.current.createOffer();
      // await peerConnection.current.setLocalDescription(offer);
      // webSocket.current.send(`click:${JSON.stringify({ type: 'offer', sdp: offer.sdp })}:${participantIdentity}:${participantName}`);
      console.log('Sent offer:', offer);
    } else {
      console.error('WebSocket is not open.');
    }
  };
  

  // 버튼 중복 생성 방지를 위한 참가자 배열 
  const filteredRemoteTracks = remoteTracks.filter((_, index) => index % 2 === 0);


  // OpenVidu 서버랑 WebSocket 서버가 공용하는 변수를 다시 사용해서 충돌났음 
  // const startLocalStream = async () => {
  //   localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //   document.getElementById('localVideo').srcObject = localStream.current;
  //   localStream.current.getTracks().forEach(track => peerConnection.current.addTrack(track, localStream.current));
  // };


  useEffect(() => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Public STUN server
      ]
    });

    peerConnection.current.onicecandidate = (event) => {
      console.log("=======================")
      console.log("peerconne")
      console.log("=======================")
      if (event.candidate && webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
        webSocket.current.send(`click:${JSON.stringify({ type: 'ice-candidate', candidate: event.candidate })}:${recipient}:${participantName}`);
      }
    };

    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.current.addTrack(track);
      });
      document.getElementById('remoteVideo').srcObject = remoteStream.current;
    };
  }, [participantName]);


  return (
    <>
      <div>CamChatting Page</div>
      {!room ? (
        <div id="join">
          <div id="join-dialog">
            <h2>Join a Video Room</h2>
            <form
              onSubmit={(e) => {
                joinRoom();
                e.preventDefault();
              }}
            >
              <div>
                <label htmlFor="participant-name">Participant</label>
                <input
                  id="participant-name"
                  className="form-control"
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="room-name">Room</label>
                <input
                  id="room-name"
                  className="form-control"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn btn-lg btn-success"
                type="submit"
                disabled={!roomName || !participantName}
              >
                Join!
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div id="room">
          <div id="room-header">
            <h2 id="room-title">{roomName}</h2>
            <button
              className="btn btn-danger"
              id="leave-room-button"
              onClick={leaveRoom}
            >
              Leave Room
            </button>

            <button
              className="btn btn-warning"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? 'Mute' : 'Unmute'}
            </button>
          </div>

          <Carousel opts={{ align: 'start' }}>
            <CarouselContent>
              {localVideoTrack && (
                <VideoComponent
                  track={localVideoTrack}
                  participantIdentity={participantName}
                  local={true}
                />
              )}

              {remoteTracks.map((remoteTrack) => {
                const { trackPublication, participantIdentity } = remoteTrack;
                const { kind, videoTrack, audioTrack, trackSid } = trackPublication;

                if (kind === 'video' && videoTrack) {
                  return (
                    <CarouselItem key={trackSid}>
                      <div>
                        <Card>
                          <VideoComponent
                            key={trackSid}
                            track={videoTrack}
                            participantIdentity={participantIdentity}
                          />
                        </Card>
                      </div>
                    </CarouselItem>
                  );
                } else if (audioTrack) {
                  return (
                    <AudioComponent key={trackSid} track={audioTrack} />
                  );
                }
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-4">
            {filteredRemoteTracks.map((remoteTrack) => (
              <Button
                key={remoteTrack.trackPublication.trackSid}
                onClick={() => handleButtonClick(remoteTrack.participantIdentity)}
                variant="default"
              >
                Token for {remoteTrack.participantIdentity}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CamChatting;
