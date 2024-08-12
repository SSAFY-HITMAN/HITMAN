import {
    LocalVideoTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
  } from "livekit-client";
  
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/Carousel.jsx";
  
  import { Card } from "@/components/ui/Card";
  import "../hooks/WebRTC/CamChatting.css";
  import { useState } from "react";
  import VideoComponent from "../hooks/WebRTC/VideoComponent.jsx";
  import AudioComponent from "../hooks/WebRTC/AudioComponent.jsx";
  import React from "react";
  import { createRoot } from "react-dom/client";
  
  
  // 로컬 환경에서는 아래 변수들을 빈 값으로 남겨두기 
  // =====> 배포할 때, 아래의 변수들을 조건에 맞게 정확한 url을 다시 setting할 것 
  let APPLICATION_SERVER_URL = "";
  let LIVEKIT_URL = "";
  
  configureUrls();
  
  function configureUrls() {
    // APPLICATION_SERVER_URL 이 설정되지 않으면, 로컬 값을 디폴트로 사용 
    const hostname = window.location.hostname;
  
    if (!APPLICATION_SERVER_URL) {
      if (window.location.hostname === "localhost") {
        APPLICATION_SERVER_URL = "http://localhost:6080/";
      } else {
        APPLICATION_SERVER_URL = "https://" + window.location.hostname + ":6443/";
      }
    }
  
    // LIVEKIT_URL 이 설정되지 않으면, 로컬 값을 디폴트로 사용 
    if (!LIVEKIT_URL) {
      if (window.location.hostname === "localhost") {
        LIVEKIT_URL = "ws://localhost:7880/";
      } else {
        LIVEKIT_URL = "wss://" + hostname + ":7443/";
      }
    }
  }
  
  const PrivateChatting = () => {
    const [room, setRoom] = useState(undefined);
    const [localTrack, setLocalTrack] = useState(undefined);
    const [remoteTracks, setRemoteTracks] = useState([]);
  
    const [participantName, setParticipantName] = useState(
      "Participant" + Math.floor(Math.random() * 100)
    );
    const [roomName, setRoomName] = useState("Test Room");
  
    async function joinRoom() {
      const room = new Room();
      setRoom(room);
  
      // 방에서 이벤트가 발생했을 때 수행할 작업 지정하기 
      room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
        setRemoteTracks(prev => [
          ...prev,
          {
            trackPublication: publication,
            participantIdentity: participant.identity,
          },
        ]);
      });
  
      // 유저 입장 처리 로직 
      room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
        setRemoteTracks(prev =>
          prev.filter(
            track => track.trackPublication.trackSid !== publication.trackSid
          )
        );
      });
  
      try {
        // 어플리케이션 서버로부터 방 이름과 유저 이름이 있는 토큰 받기 
        console.log(roomName, participantName);
        const token = await getToken(roomName, participantName);
        console.log("Token retrieved:", token);
  
        // LiveKit URL 와 token 으로 방에 연결하기 
        await room.connect(LIVEKIT_URL, token);
        console.log("Connected to room");
  
        // 카메라 및 마이크 게시하기 
        await room.localParticipant.enableCameraAndMicrophone();
        setLocalTrack(
          room.localParticipant.videoTrackPublications.values().next().value
            .videoTrack
        );
      } catch (error) {
        console.log("There was an error connecting to the room:", error.message);
        await leaveRoom();
      }
    }
  
    async function leaveRoom() {
      // 'disconnect' 버튼을 눌러 호출하며 방 떠나기 
      await room?.disconnect();
  
      // 상태 값 초기화 
      setRoom(undefined);
      setLocalTrack(undefined);
      setRemoteTracks([]);
    }
  
    async function getToken(roomName, participantName) {
      const response = await fetch(APPLICATION_SERVER_URL + "token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
  
    return (
      <>
        <div>CamChatting Page</div>
        {!room ? (
          <div id="join">
            <div id="join-dialog">
              <h2>Join a Video Room</h2>
              <form
                onSubmit={e => {
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
                    onChange={e => setParticipantName(e.target.value)}
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
                    onChange={e => setRoomName(e.target.value)}
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
            </div>
            
            <Carousel opts={{ align: "start", }} >
              <CarouselContent> 
                {/* 나 자신  */}
                {/* {localTrack && (
                  <VideoComponent                  
                    track={localTrack}
                    participantIdentity={participantName}
                    local={true}
                  />
                )} */}
  
                {/* 다른 참여자들 */}
                {remoteTracks.map((remoteTrack) => {
                  console.log(remoteTracks);
                  const { trackPublication, participantIdentity } = remoteTrack;
                  const { kind, videoTrack, audioTrack, trackSid } =
                    trackPublication;
                  console.log(`trackSid: ${trackSid}`);
  
                  if (kind === "video" && videoTrack) {
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
                    )
                  }
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </>
    );
  };
  
  export default PrivateChatting;
  