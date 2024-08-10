import { useEffect, useRef } from "react";
import { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import "./PrivateVideoComponent.css";

function PrivateVideoComponent({ track, participantIdentity, local = false }) {
  const videoElement = useRef(null);

  useEffect(() => {
    if (videoElement.current) {
      track.attach(videoElement.current);
    }

    return () => {
      track.detach();
    };
  }, [track]);

  return (
    <div id={"camera-" + participantIdentity} className="video-container">
      <div className="participant-data">
        <p>{participantIdentity + (local ? " (You)" : "")}</p>
      </div>      
      {/* 비디오 레이어가 계속 생성되는 지점  */}
      <video className="video-box" ref={videoElement} id={track.sid}></video>
    </div>
  );
}

export default PrivateVideoComponent;
