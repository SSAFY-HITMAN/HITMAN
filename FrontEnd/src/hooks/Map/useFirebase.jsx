import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// !!!!!!!!!!!!!!!!!! 아래정보들은 민감정보이니 그대로 적지말고 env.local 파일로 빼서 반드시 .gitignore에 추가해주세요

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 사용자의 타겟의 위치를 지속적으로 수신 및 사용자의 위치 전송 함수 정의
// 사용자의 위치 전송은 pages/GamePlay.jsx에서 1초마다 실행
const useFirebase = () => {
  const { targetId, setTargetLocation } = useContext(GameContext);
  const targetGPSRef = useRef(null);

  useEffect(() => {
    if (targetId) {
      // 타겟의 위치가 있는 DB 위치에 ref 설정
      targetGPSRef.current = ref(db, "locate/" + targetId);

      // 타겟의 위치를 watch
      onValue(targetGPSRef.current, snapshot => {
        const data = snapshot.val();
        if (
          data &&
          typeof data.lat === "string" &&
          typeof data.lng === "string"
        ) {
          const newTargetLocation = {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
          };
          setTargetLocation(newTargetLocation);
        } else {
          // 타겟 위치 수신에 문제 발생 시
          console.log("Invalid data format received:", data);
        }
      });
    }

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      if (targetGPSRef.current) {
        off(targetGPSRef.current);
      }
    };
  }, [targetId, setTargetLocation]);

  const sendGPS = (username, lat, lng) => {
    const myGPSRef = ref(db, "locate/" + username);
    set(myGPSRef, {
      host: username,
      lat: lat.toString(),
      lng: lng.toString(),
    })
      .then(() => {
        console.log("Data saved successfully!");
      })
      .catch(error => {
        console.error("Failed to save location:", error);
      });
  };

  return { sendGPS };
};

export default useFirebase;
