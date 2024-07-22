import {
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent
} from "livekit-client";
import "../hooks/WebRTC/CamChatting.css";
import { useState } from "react";
import VideoComponent from "../hooks/WebRTC/VideoComponent.jsx";
import AudioComponent from "../hooks/WebRTC/AudioComponent.jsx";
import React from 'react';
import { createRoot } from 'react-dom/client';

// For local development, leave these variables emptytaskkill /f /pid
// For production, configure them with correct URLs depending on your deployment
let APPLICATION_SERVER_URL = "";
let LIVEKIT_URL = "";

configureUrls();

function configureUrls() {
  // If APPLICATION_SERVER_URL is not configured, use default value from local development
  const hostname = window.location.hostname;

  if (!APPLICATION_SERVER_URL) {
    if (window.location.hostname === "localhost") {
      APPLICATION_SERVER_URL = "http://localhost:6080/";
    } else {
      APPLICATION_SERVER_URL = "https://" + window.location.hostname + ":6443/";
    }
  }

  // If LIVEKIT_URL is not configured, use default value from local development
  if (!LIVEKIT_URL) {
    if (window.location.hostname === "localhost") {
      LIVEKIT_URL = "ws://localhost:7880/";
    } else {
      LIVEKIT_URL = "wss://" + hostname + ":7443/";
    }
  }
}




const CamChatting = () => {
  const [room, setRoom] = useState(undefined);
  const [localTrack, setLocalTrack] = useState(undefined);
  const [remoteTracks, setRemoteTracks] = useState([]);    

  const [participantName, setParticipantName] = useState("Participant" + Math.floor(Math.random() * 100));
  const [roomName, setRoomName] = useState("Test Room");

  async function joinRoom() {
    // Initialize a new Room object
    const room = new Room();
    setRoom(room);

    // Specify the actions when events take place in the room
    // On every new Track received...
    room.on(
      RoomEvent.TrackSubscribed,
      (_track, publication, participant) => {
          setRemoteTracks((prev) => [
            ...prev,
            { trackPublication: publication, participantIdentity: participant.identity }
        ]);
      }
    );

    // On every Track destroyed...
    room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks(prev => prev.filter(track => track.trackPublication.trackSid !== publication.trackSid));
    });

    try {
      // Get a token from your application server with the room name and participant name
      console.log(roomName, participantName)
      const token = await getToken(roomName, participantName);
      console.log('Token retrieved:', token);

      // Connect to the room with the LiveKit URL and the token
      await room.connect(LIVEKIT_URL, token);
      console.log('Connected to room');

      // Publish your camera and microphone
      await room.localParticipant.enableCameraAndMicrophone();
      setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value.videoTrack);
    } catch (error) {
      console.log("There was an error connecting to the room:", error.message);
      await leaveRoom();
    }
  }

  async function leaveRoom() {
    // Leave the room by calling 'disconnect' method over the Room object
    await room?.disconnect();

    // Reset the state
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
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
                <button className="btn btn-danger" id="leave-room-button" onClick={leaveRoom}>
                    Leave Room
                </button>
            </div>
            <div id="layout-container">
                {localTrack && (
                    <VideoComponent track={localTrack} participantIdentity={participantName} local={true} />
                )}
                {remoteTracks.map((remoteTrack) => {
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
                })};

            </div>
        </div>
      )}
    </>
  );
};

export default CamChatting;
