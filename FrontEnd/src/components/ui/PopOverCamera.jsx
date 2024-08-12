import React, { useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";

const PopOverCamera = ({ open, publisher, handleMainVideoStream }) => {
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

            // 캡처된 이미지를 다운로드할 수 있도록 링크를 생성
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'capture.png';
            link.click();
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div className="relative" style={{ width: '400%' }}>
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
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
