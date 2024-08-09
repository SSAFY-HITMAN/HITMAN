import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Room,
  RoomEvent
} from "livekit-client";
import { Button } from "@/components/ui/Button";
import "../hooks/WebRTC/CamChatting.css";
import VideoComponent from "../hooks/WebRTC/VideoComponent.jsx";
import AudioComponent from "../hooks/WebRTC/AudioComponent.jsx";

let APPLICATION_SERVER_URL = '';
let OPENVIDU_URL = '';

configureUrls();

function configureUrls() {
  const hostname = window.location.hostname;

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

const PrivateChatting = () => {
  console.log(`PrivateChatting component rendered`);
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState({});
  const [localTracks, setLocalTracks] = useState({});
  const [remoteTracks, setRemoteTracks] = useState([]);
  const initializedRef = useRef(false);  // 추가: 초기화 확인용 Ref

  // 전달된 state 정보를 받아와서 상태에 저장하는 로직
  useEffect(() => {
    if (initializedRef.current) return; // 초기화된 경우 더 이상 실행되지 않도록 함

    console.log("useEffect for location.state triggered");
    if (location.state && Array.isArray(location.state)) {
      console.log("location.state is an array:", location.state);
      setUsers(location.state);
      initializedRef.current = true;  // 초기화 완료 표시
    } else {
      console.log("location.state is not an array:", location.state);
    }
  }, [location.state]);

  // users 배열이 변경될 때마다 각 유저가 방에 입장하는 로직
  useEffect(() => {
    if (users.length > 0) {
      console.log("users array changed:", users);
      users.forEach(user => {
        if (!rooms[user.privateRoom]) { // 해당 방에 아직 입장하지 않았을 때만 입장
          joinRoom(user.name, user.privateRoom);
        }
      });
    }
  }, [users]);

  async function joinRoom(name, roomName) {
    console.log(`Joining room: ${roomName} as ${name}`);

    const newRoom = new Room();
    setRooms(prevRooms => ({ ...prevRooms, [roomName]: newRoom }));

    newRoom.on(RoomEvent.TrackSubscribed, 
      (_track, publication, participant) => {
        setRemoteTracks(prev => [
          ...prev,
          {
            trackPublication: publication,
            participantIdentity: participant.identity,
            roomName: roomName
          },
        ]);
      }
    );

    newRoom.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks(prev =>
        prev.filter(track => track.trackPublication.trackSid !== publication.trackSid)
      );
    });

    try {
      console.log(roomName, name);
      const token = await getToken(roomName, name);
      console.log('Token retrieved:', token);

      await newRoom.connect(OPENVIDU_URL, token);
      console.log('Connected to room');

      await newRoom.localParticipant.enableCameraAndMicrophone();
      setLocalTracks(prev => ({
        ...prev,
        [roomName]: newRoom.localParticipant.videoTrackPublications.values().next().value.videoTrack
      }));
    } catch (error) {
      console.log("There was an error connecting to the room:", error.message);
      await leaveRoom(name, roomName);
    }
  };

  async function leaveRoom(name, roomName) {
    console.log(`Leaving room for user: ${name}`);
    setUsers(prevUsers => prevUsers.filter(user => user.name !== name));
    const room = rooms[roomName];
    await room?.disconnect();
    
    setRooms(prev => {
      const { [roomName]: _, ...rest } = prev;
      return rest;
    });
    setLocalTracks(prev => {
      const { [roomName]: _, ...rest } = prev;
      return rest;
    });
    setRemoteTracks(prev => prev.filter(track => track.roomName !== roomName));

    navigate("/cam-chatting");
  }

  async function getToken(roomName, participantName) {
    const response = await fetch(APPLICATION_SERVER_URL + "token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
      <div>PrivateChatting Page</div>
      {Object.keys(rooms).length > 0 ? (
        Object.keys(rooms).map(roomName => (
          <div key={roomName} id="room">
            <div id="room-header">
              <h2 id="room-title">{roomName}</h2>
            </div>

            {localTracks[roomName] && (
              <VideoComponent track={localTracks[roomName]} participantIdentity={users.map(p => p.name).join(', ')} local={true} />
            )}
            {remoteTracks.filter(track => track.roomName === roomName).map(remoteTrack => {
              const { trackPublication, participantIdentity } = remoteTrack;
              const { kind, videoTrack, audioTrack, trackSid } = trackPublication;

              if (kind === "video" && videoTrack) {
                return (
                  <VideoComponent
                    key={trackSid}
                    track={videoTrack}
                    participantIdentity={participantIdentity}
                  />
                );
              } else if (audioTrack) {
                return (
                  <AudioComponent
                    key={trackSid}
                    track={audioTrack}
                  />
                );
              }
            })}

            <div className="mt-5">
              <Button onClick={() => leaveRoom(users.find(user => user.privateRoom === roomName).name, roomName)}>Leave Room</Button>
            </div>
          </div>
        ))
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default PrivateChatting;
