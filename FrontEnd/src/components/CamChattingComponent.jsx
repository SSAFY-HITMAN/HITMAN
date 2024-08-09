import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Room,
  RoomEvent,
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

// 로컬 환경에서는 아래 변수들을 빈 값으로 남겨두기 
// ==> 배포할 때, 아래의 변수들을 조건에 맞게 정확한 url을 다시 설정할 것 
// ====> 변수 수정 : LIVEKIT_URL -> OPENVIDU_URL
let APPLICATION_SERVER_URL = '';
let OPENVIDU_URL = '';

configureUrls();

// URL을 설정하는 함수
function configureUrls() {
  const hostname = window.location.hostname;
  
  // APPLICATION_SERVER_URL이 설정되지 않으면 로컬 값을 디폴트로 사용 
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

const CamChattingComponent = () => {
  const [room, setRoom] = useState(undefined);                          // 방 생성 시 사용
  const [localVideoTrack, setLocalVideoTrack] = useState(undefined);    // 화상 채팅 때 사용하는 비디오 변수 
  const [localAudioTrack, setLocalAudioTrack] = useState(undefined);    // 음소거 관련
  const [remoteTracks, setRemoteTracks] = useState([]);                 // 본인을 제외한 참여자 
  const [participants, setParticipants] = useState([]);                 
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);           // 음소거 관련 boolean 
  const [participantName, setParticipantName] = useState('Participant' + Math.floor(Math.random() * 100));    // 임시 참가 유저명 생성 
  const [roomName, setRoomName] = useState('Test Room');                // 방 이름 초깃값 

  const webSocket = useRef(null);   // 웹소켓
  const [messages, setMessages] = useState([]);

  const [recipient, setRecipient] = useState(undefined);

  const peerConnection = useRef(null);
  const privateRoom = useRef("")
  const fromUser = useRef("")
  const toUser = useRef("")

  const remoteStream = useRef(new MediaStream());
  const navigate = useNavigate();

  // RemoteTracks 상태가 변경될 때마다 로그 출력
  useEffect(() => {
    console.log('updated rooms:', room);
  }, [room]);

  useEffect(()=> {
    console.log("Updated RemoteTracks : ", remoteTracks)
  })

  // 이벤트 핸들러 함수 정의
  const handleParticipantConnected = (participant) => {
    setParticipants((prev) => {
      const updatedParticipants = [...prev, participant];
      // console.log('Updated participants after connection:', updatedParticipants);
      return updatedParticipants;
    });
  };

  const handleParticipantDisconnected = (participant) => {
    setParticipants((prev) => {
      const updatedParticipants = prev.filter((p) => p.identity !== participant.identity);
      console.log('Updated participants after disconnection:', updatedParticipants);
      return updatedParticipants;
    });
  
    setRemoteTracks((prev) => {
      const updatedRemoteTracks = prev.filter((track) => track.participantIdentity !== participant.identity);
      console.log('Updated remote tracks after disconnection:', updatedRemoteTracks);
      return updatedRemoteTracks;
    });
  };

  const handleTrackSubscribed = (_track, publication, participant) => {
    setRemoteTracks((prev) => {
      const newTrack = {
        trackPublication: publication,
        participantIdentity: participant.identity,
      };
      if (prev.some(track => track.trackPublication.trackSid === publication.trackSid)) {
        return prev;
      }
      return [...prev, newTrack];
    });
  };

  const handleTrackUnsubscribed = (_track, publication) => {
    setRemoteTracks((prev) =>
      prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid)
    );
  };

  // 참가자가 방에 접속해서 연결될 때를 감지해서 실행 
  useEffect(() => {
    if (room) {
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      // cleanup 함수에서 이벤트 리스너 제거
      return () => {
        room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      };
    }
  }, [room]);

  // WebRTC의 RTCPeerConnection 객체를 설정 
  // WebRTC 연결을 설정하고 원격 스트림 처리 
  useEffect(() => {

    // RTCPeerConnection 객체 생성 및 ICE 서버 (google STUN 서버 사용)
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // ICE 후보(웹소켓을 사용하는 참가자)가 생성될 때 이 핸들러가 호출 
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
        // ICE 후보가 생성되면 WebSocket을 통해 상대 피어에게 ICE 후보 정보를 전송합니다.
        webSocket.current.send(`click:${JSON.stringify({ type: 'ice-candidate', candidate: event.candidate })}:${recipient}:${participantName}`);
      }
    };

  }, [participantName, recipient]);

  // 수령자(웹소켓 toast 메세지 받는 사람)이 바뀔 때 추적 변경
  useEffect(() => {
    if (recipient !== undefined) {
      console.log(`Updated recipient: ${recipient}`);
    }
  }, [recipient]);

  // 방 안의 참가자들을 실시간으로 살피기 (디버깅용)
  // useEffect(() => {
  //   console.log('update participants list: ', participants)
  // }, [participants]);

  // {fromUser.data}님이 {toUser.data}님을 비밀채팅으로 초대하셨습니다. 수락하시겠습니까? 를 발생시키기 위한 이벤트 핸들러
  // InvitationToast 내부에서 사용  
  const handleButtonClick = async (receiver) => {
    console.log(receiver);
    console.log(webSocket.current);  

    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      setRecipient(receiver);
      try {
        console.log(`handleButtonClick peerConnection`)
        console.log(peerConnection);
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        const message = {
          type: 'offer',
          fromUser: participantName,
          toUser: receiver,
          curRoom: roomName,
          privateRoom: 'Room' + Math.floor(Math.random() * 100) 
        };
        webSocket.current.send(`click:${JSON.stringify(message)}`);
        console.log('Sent offer:', message);
      } catch (error) {
        console.error('Error creating or sending offer:', error);
      }
    } else {
      console.error('WebSocket is not open.');
    }
  };

  // {toUser.data}님이 초대를 수락하셨습니다. 를 발생시키기 위한 이벤트 핸들러
  // MoveToPrivateChatToast 내부에서 사용됨 
  const handleAcceptClick = async (receiver) => {
    console.log(receiver);
    console.log(webSocket.current); 
    
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      setRecipient(receiver);
      try {
        console.log(`handleAcceptClick peerConnection`)
        console.log(peerConnection);
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        const message = {
          type: 'answer',
          fromUser: toUser.current,
          toUser: fromUser.current, 
          curRoom: roomName,
          privateRoom: privateRoom.current
        };
        webSocket.current.send(`click:${JSON.stringify(message)}`);
        console.log('Sent answer:', message);
  
        // 여기에서 participants 배열 상태 출력
        console.log('Participants before navigating:', participants);
  
      } catch (error) {
        console.error('Error creating or sending answer:', error);
      }
    } else {
      console.error('WebSocket is not open.');
    }
  };

  // InvitationToast 컴포넌트 정의
  const InvitationToast = () => (
    <div>
      <p>{fromUser.current}님이 {toUser.current}님을 비밀채팅으로 초대하셨습니다. 수락하시겠습니까?</p>
      <br/>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <Button
          variant="accept"
          onClick={async () => {
            await handleAcceptClick(toUser.current);


            
            if (room) {
              room.disconnect();
              const localParticipant = room.localParticipant;
              localParticipant.videoTracks.forEach(publication => publication.track.stop());
              localParticipant.audioTracks.forEach(publication => publication.track.stop());
            }

            leaveRoom();

            console.log('Participants before navigating from InvitationToast:', participants);

            navigate('/private-chatting', {
              state: [{
                id: toUser.current,
                name: toUser.current,
                camChatting: roomName,
                privateRoom: privateRoom.current,
              }],
            });
          }}
        >
          수락
        </Button>
        <Button
          variant="decline"
          onClick={() => 
            console.log('Declined!')
          }
        >
          거절
        </Button>
      </div>
    </div>
  );

  // MoveToPrivateChatToast 컴포넌트 정의
  const MoveToPrivateChatToast = () => (
    <div>
      <p>{toUser.current}님이 초대를 수락하셨습니다. </p>
      <br/>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <Button
          variant="accept"
          
          onClick={async () => {
            if (room) {
              room.disconnect();
              const localParticipant = room.localParticipant;
              localParticipant.videoTracks.forEach(publication => publication.track.stop());
              localParticipant.audioTracks.forEach(publication => publication.track.stop());
            }


            // leaveRoom();

            console.log('Participants before navigating from InvitationToast:', participants);

            navigate('/private-chatting', {
              state: [{
                id: toUser.current,
                name: toUser.current,
                camChatting: roomName,
                privateRoom: privateRoom.current,
              }],
            });
          }}
        >
          이동
        </Button>
      </div>
    </div>
  );

  // 참가자가 입장할 때 방 생성, 등록 
  async function joinRoom() {
    const room = new Room();
    setRoom(room);
    
    // 웹소켓 연결 활성화
    const ws = new WebSocket('ws://localhost:6080/ChattingServer');
    webSocket.current = ws;
  
    ws.onopen = () => {
      console.log('WebSocket connection opened.');
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onmessage = async (event) => {
      let signalData;
    
      setMessages(event.data)

      if (typeof event.data === 'undefined' || event.data === null) {
        throw new Error("Received message is undefined or null");
      }

      const parts = event.data.split(':');
  
      if (parts && parts.length > 2) {
        console.log("메세지를 받았습니다.")
        
        signalData = parts[0].trim();
        toUser.current = parts[1].trim();
        fromUser.current = parts[2].trim();
        setRoomName(parts[3].trim());
        privateRoom.current = parts[4].trim();

        console.log(`privateRoom: ${privateRoom.current}`)  
        console.log(`toUser: ${toUser.current}`);
        console.log(`fromUser: ${fromUser.current}`);
        console.log(`signalData: ${signalData}`);
        
        if (signalData === "offer"){
          console.log(`======== InvitationToast ======>`)
          console.log(`toUser: ${toUser.current}`);
          toast(<InvitationToast />);
          
        } else if (signalData === "answer"){
          console.log(`======== MoveToPrivateChatToast ======>`)
          console.log(`fromUser: ${fromUser.current}`);
          toast(<MoveToPrivateChatToast />)
        }
      }
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);  
  
    try {
      // 방 입장시 토큰 생성 
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
      // 카메라와 마이크 끄기
      if (room) {
        const localParticipant = room.localParticipant;

        // 비디오 트랙 끄기
        if (localParticipant.videoTrackPublications) {
          localParticipant.videoTrackPublications.forEach(publication => {
            if (publication.track) {
              publication.track.stop();
            }
          });
        }

        // 오디오 트랙 끄기
        if (localParticipant.audioTrackPublications) {
          localParticipant.audioTrackPublications.forEach(publication => {
            if (publication.track) {
              publication.track.stop();
            }
          });
        }
      }
    }
  }


  // 방을 떠나는 함수
  async function leaveRoom() {
    console.log('leaveRoom called');

    if (room) {
      // 트랙이 존재하는지 확인한 후 forEach 호출
      if (room.localParticipant && room.localParticipant.tracks) {
        room.localParticipant.tracks.forEach(publication => {
          if (publication.track) {
            publication.track.stop();
            room.localParticipant.unpublishTrack(publication.track);
          }
        });
      }

      // 참가자가 존재하는지 확인한 후 forEach 호출
      if (room.participants) {
        room.participants.forEach(participant => {
          if (participant.tracks) {
            participant.tracks.forEach(publication => {
              if (publication.track) {
                publication.track.stop();
                participant.unpublishTrack(publication.track);
              }
            });
          }
        });
      }

      // 이벤트 리스너 제거
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

      await room.disconnect(); // 방 연결 끊기
      console.log('Disconnected from room');

      setRoom(undefined);
      setLocalVideoTrack(undefined);
      setLocalAudioTrack(undefined);
      setRemoteTracks([]);
      setParticipants([]);

      console.log("---- fromUser and toUser ----->")
      console.log(`fromUser: ${fromUser.data}`)
      console.log(`toUser: ${toUser.data}`)


      console.log('=== State after room disconnection: ===>');
      console.log('Participants:', participants);
      console.log('RemoteTracks:', remoteTracks);
    }

    if (webSocket.current) {
      webSocket.current.close(); // WebSocket 연결 닫기
      console.log('WebSocket connection closed.');
    }

    console.log('====>>Participants after leaving room:', participants);
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

    console.log(`===== ${participantName} =====>`)

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get token: ${error.errorMessage}`);
    }

    const data = await response.json();
    return data.token;
  }

  // 시작부터 음소거 모드
  const toggleAudio = () => {
    if (room) {
      const isCurrentlyEnabled = room.localParticipant.isMicrophoneEnabled;
      console.log(`isCurrentlyEnabled: ${isCurrentlyEnabled}`)
      room.localParticipant.setMicrophoneEnabled(!isCurrentlyEnabled);
      setIsAudioEnabled(!isCurrentlyEnabled);
    }
  };

  // 버튼 중복 생성을 방지하기 위한 참가자 배열 
  const filteredRemoteTracks = remoteTracks.filter((_, index) => index % 2 === 0);

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

              {remoteTracks.map((remoteTrack, index) => {
                const { trackPublication, participantIdentity } = remoteTrack;
                const { kind, videoTrack, audioTrack, trackSid } = trackPublication;

                if (kind === 'video' && videoTrack) {
                  return (
                    <CarouselItem key={`${participantIdentity}-${trackSid}-${index}`} >
                      <div>
                        <Card>
                          <VideoComponent
                            key={`${participantIdentity}-${trackSid}-${index}`}
                            track={videoTrack}
                            participantIdentity={participantIdentity}
                          />
                        </Card>
                      </div>
                    </CarouselItem>
                  );
                } else if (audioTrack) {
                  return (
                    <AudioComponent key={`${participantIdentity}-${trackSid}-${index}`} track={audioTrack} />
                  );
                }
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-4">
            {filteredRemoteTracks.map((remoteTrack, index) => (
              <Button
                key={`${remoteTrack.participantIdentity}-${index}`}
                onClick={() => handleButtonClick(remoteTrack.participantIdentity)}
                variant="default"
              >
                Token for {remoteTrack.participantIdentity}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <ToastContainer
              position="bottom-right"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CamChattingComponent;
