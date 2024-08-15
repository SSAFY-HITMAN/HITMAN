import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useParams } from "react-router-dom";

import useItemCount from "@/hooks/Map/useItemCount";
import useBullet from "@/hooks/Map/useBullet";
import axiosInstance from "@/api/axiosInstance"; // 추가

import * as Popover from "@radix-ui/react-popover";
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";

// missionId 추가
const PopOverCamera = ({
  switchCamera,
  open,
  publisher,
  missionId,
  handleMainVideoStream,
}) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 수정부분
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { getItem } = useItemCount();
  const { getBullet } = useBullet();
  const { gameRoomId: paramGameRoomId } = useParams();

  // 새로운 미션이 시작될 때 후면 카메라로 전환
  useEffect(() => {
    if (open) {
      // 미션이 열렸을 때 후면 카메라로 전환
      switchCamera("environment");
    }

    // 컴포넌트 언마운트 시 카메라를 원래 상태로 복원
    return () => {
      switchCamera("user"); // 정면 카메라로 전환
    };
  }, [open, switchCamera]);

  const captureImage = () => {
    setIsButtonDisabled(true); // 수정부분

    if (videoRef.current) {
      const video = videoRef.current.querySelector("video");
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ================================
      // 어제 test에서 주석처리한 부분, 작동 확인 필요
      //   const image = canvas.toDataURL("image/png");
      //   const link = document.createElement("a");
      //   link.href = image;
      //   link.download = "capture.png";
      //   link.click();
      // ================================

      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("file", blob);
        // 수정
        formData.append("username", localStorage.getItem("username"));
        formData.append("gameId", sessionStorage.getItem("gameRoomId"));
        formData.append("missionId", missionId);

        // axiosInstance 사용 수정

        axiosInstance
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
              alert("미션 성공! 유용한 도구와 총알을 획득했습니다.");
            } else if (response.status === 202) {
              alert("미션 실패!");
              setIsButtonDisabled(false); // 수정부분
            }
          })
          .catch(error => {
            console.error("Error uploading file:", error);
            alert("파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
            setIsButtonDisabled(false); // 수정부분
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
        {/* 수정부분 */}
        <Button onClick={captureImage} disabled={isButtonDisabled}>
          캡처
        </Button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />{" "}
    </div>
  );
};

export default PopOverCamera;
