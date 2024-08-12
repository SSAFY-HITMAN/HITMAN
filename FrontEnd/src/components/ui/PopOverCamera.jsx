import React, { useRef } from 'react';
import axios from 'axios';
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";

const PopOverCamera = ({ open, publisher, handleMainVideoStream, missionChangeRequest }) => {
    const videoRef = useRef(null); // 비디오 요소에 접근하기 위한 ref
    const canvasRef = useRef(null); // 캡처된 이미지를 그릴 canvas 요소 ref

    const captureImage = () => {
        if (videoRef.current) {
            const video = videoRef.current.querySelector('video'); // UserVideoComponent 내부의 비디오 요소
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // canvas를 Blob으로 변환하고 서버에 전송
            canvas.toBlob((blob) => {
                const formData = new FormData();
                formData.append('file', blob);

                // DTO 필드 값을 FormData에 추가
                formData.append('username', missionChangeRequest.username);
                formData.append('gameId', missionChangeRequest.gameId);
                formData.append('missionId', missionChangeRequest.missionId);

                // 서버에 POST 요청
                axios.post('/in-game/imageMission', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    if (response.status === 200) {
                        // 성공적인 응답 처리
                        const obtained = response.data.itemId;
                        alert(`미션 성공! 아이템 ID: ${obtained}`);
                    } else if (response.status === 400) {
                        alert('미션 실패!');
                    } else if (response.status === 404) {
                        alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
                    } else {
                        alert('예상치 못한 응답 상태: ' + response.status);
                    }
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    alert('파일 업로드 중 오류가 발생했습니다. 콘솔을 확인하세요.');
                });
            }, 'image/png');
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div className="relative" style={{ width: '400%' }}>
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4 flex justify-center items-center">
                {publisher && (
                    <div 
                        ref={videoRef} 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ objectFit: 'cover' }}
                        onClick={() => handleMainVideoStream(publisher)}
                    >
                        <UserVideoComponent streamManager={publisher} />
                    </div>
                )}
            </div>

            <button 
                onClick={captureImage} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                캡처
            </button>

            <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* 캡처 이미지를 그릴 canvas */}
        </div>
    );
};

export default PopOverCamera;
