import React, { useRef } from "react";
import { Button } from "@/components/ui/Button";
import useItemCount from "@/hooks/Map/useItemCount";
import useBullet from "@/hooks/Map/useBullet";

import * as Popover from "@radix-ui/react-popover";
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";

const PopOverCamera = ({ open, publisher, handleMainVideoStream }) => {
  const videoRef = useRef(null); // 비디오 요소에 접근하기 위한 ref
  const canvasRef = useRef(null); // 캡처된 이미지를 그릴 canvas 요소 ref
  const { getItem } = useItemCount();
  const { getBullet } = useBullet();

  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current.querySelector("video"); // UserVideoComponent 내부의 비디오 요소
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // // 캡처된 이미지를 다운로드할 수 있도록 링크를 생성
      // const image = canvas.toDataURL("image/png");
      // const link = document.createElement("a");
      // link.href = image;
      // link.download = "capture.png";
      // link.click();

      // canvas를 Blob으로 변환하고 서버에 전송
      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("file", blob);

        // DTO 필드 값을 FormData에 추가
        formData.append("username", missionChangeRequest.username);
        formData.append("gameId", missionChangeRequest.gameId);
        formData.append("missionId", missionChangeRequest.missionId);

        // 서버에 POST 요청
        axios
          .post("/in-game/imageMission", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(response => {
            if (response.status === 200) {
              // 성공적인 응답 처리
              const obtained = response.data.itemId;
              getItem(obtained);
              getBullet(1);
              alert(`미션 성공! 아이템 ID: ${obtained}`);
            } else if (response.status === 400) {
              alert("미션 실패!");
            } else if (response.status === 404) {
              alert("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            } else {
              alert("예상치 못한 응답 상태: " + response.status);
            }
          })
          .catch(error => {
            console.error("Error uploading file:", error);
            alert("파일 업로드 중 오류가 발생했습니다. 콘솔을 확인하세요.");
          });
      }, "image/png");
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="relative mb-4 flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {publisher && (
          <div
            ref={videoRef}
            className="flex items-center justify-center"
            style={{ objectFit: "cover", width: "320px", zIndex: 500 }}
            onClick={() => handleMainVideoStream(publisher)}
          >
            <UserVideoComponent streamManager={publisher} />
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <Button onClick={captureImage}>캡처</Button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />{" "}
      {/* 캡처 이미지를 그릴 canvas */}
    </div>
  );
};

export default PopOverCamera;
