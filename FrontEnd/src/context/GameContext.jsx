import React, { createContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const approximateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 지구의 반지름 (m)
  const toRadians = angle => angle * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const avgLatRad = (lat1Rad + lat2Rad) / 2;
  const x = dLng * Math.cos(avgLatRad);
  const distance = Math.sqrt(dLat * dLat + x * x) * R;

  return parseFloat(distance.toFixed(1)); // 거리의 소수점 이하 1자리까지, 미터 단위
};

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameRoomId, setGameRoomId] = useState(() => {
    return sessionStorage.getItem("gameRoomId") || "";
  }); // 게임 방 번호
  const [gameRoomUsers, setGameRoomUsers] = useState([]); // 참여자 목록
  const [isGameRoomLoading, setIsGameRoomLoading] = useState(false); // Room.jsx에서 로딩 스피너 사용
  const [gameStatus, setGameStatus] = useState(() => {
    const savedGameStatus = sessionStorage.getItem("gameStatus");
    return savedGameStatus === "true";
  }); // 게임방 플레이 상태
  const [isAlive, setIsAlive] = useState(() => {
    const savedIsAlive = sessionStorage.getItem("isAlive");
    return savedIsAlive === "true";
  }); // 플레이어의 생존 상태 (게임 시작 시 true로 전환되고 sessionStorage에 저장됨)
  const [areaCenter, setAreaCenter] = useState(() => {
    const savedCenter = sessionStorage.getItem("areaCenter"); // 기본적으로 String
    return savedCenter ? JSON.parse(savedCenter) : { lat: 0, lng: 0 };
  }); // 영역 중심
  const [areaRadius, setAreaRadius] = useState(() => {
    const savedRadius = sessionStorage.getItem("areaRadius");
    return savedRadius !== null ? parseFloat(savedRadius) : null;
  }); // 영역 반경
  const [myLocation, setMyLocation] = useState({ lat: 0, lng: 0 }); // 내 위치
  const [targetId, setTargetId] = useState(() => {
    const savedTargetId = sessionStorage.getItem("targetId");
    return savedTargetId !== null ? savedTargetId : null;
  }); // 타겟 ID(닉네임)
  const [targetLocation, setTargetLocation] = useState(null); // 타겟 위치
  const [distance, setDistance] = useState(null); // 사용자와 영역 중심 간 거리
  const [distToTarget, setDistToTarget] = useState(null); // 사용자와 타겟 간 거리
  const [missionList, setMissionList] = useState([
    { missionId: 1, category: "1", target: "A", alt: "a", done: true },
    { missionId: 2, category: "2", target: "의자", alt: "chair", done: false }, // 임시 데이터
    {
      missionId: 3,
      category: "3",
      target: "#e35e4b",
      alt: "227-94-75",
      done: true,
    },
  ]); // 미션 목록
  const [playerCount, setPlayerCount] = useState(() => {
    const savedPlayerCount = sessionStorage.getItem("playerCount");
    return savedPlayerCount !== null ? parseInt(savedPlayerCount, 10) : null;
  });
  const [toOffChatting, setToOffChatting] = useState(false);
  const username = localStorage.getItem("username"); // sendGPS 함수에서 활용 (useFirebase.jsx)
  // 로그인 시 setItem 대상이 sessionStorage로 변경되면 이 부분도 같이 변경되어야 함

  // item 적용 여부 부분
  const [blockGPS, setBlockGPS] = useState(false); // 스텔스 망토
  const [blockScreen, setBlockScreen] = useState(false); // 방해 폭탄

  const DISTANCE_TO_CATCH = 5; // 잡기 버튼이 활성화되기 위한 타겟과의 거리
  const DISTANCE_ENHANCED_BULLET = 10; // 강화 총알 거리
  const [distToCatch, setDistToCatch] = useState(DISTANCE_TO_CATCH);

  // 총알 관리
  const [bullet, setBullet] = useState(() => {
    const savedBullet = sessionStorage.getItem("bullets");
    return savedBullet !== null ? parseInt(savedBullet, 10) : 0;
  }); // 총알 수

  // GamePlay.jsx 진입 시 fetch 함수 호출로 아이템 개수는 새로 세팅됨
  const [itemList, setItemList] = useState([
    { itemId: 1, count: 0 }, // 스텔스 망토 (GPS)
    { itemId: 2, count: 0 }, // 방해 폭탄 (screen)
    { itemId: 3, count: 0 }, // 강화 총알
  ]);
  const [blockGPSCount, setBlockGPSCount] = useState(0);
  const [blockScreenCount, setBlockScreenCount] = useState(0);
  const [enhancedBulletCount, setEnhancedBulletCount] = useState(0);

  // 위치 보정
  const GET_POSITION_COUNT = 5;

  const myLocationRef = useRef(myLocation);
  const targetLocationRef = useRef(targetLocation);
  const areaCenterRef = useRef(areaCenter);

  useEffect(() => {
    myLocationRef.current = myLocation;
    // console.log(
    //   `myLocation: ${myLocationRef.current.lat} ${myLocationRef.current.lng}`
    // );
  }, [myLocation]);

  useEffect(() => {
    targetLocationRef.current = targetLocation;
  }, [targetLocation]);

  useEffect(() => {
    areaCenterRef.current = areaCenter;
  }, [areaCenter]);

  // 남은 사람 수 렌더링 되지 않는 문제 해결
  useEffect(() => {
    sessionStorage.setItem("playerCount", playerCount);
  }, [playerCount]);

  const calculationAverageLocation = (latSum, lngSum, count) => {
    const averageLat = latSum / count;
    const averageLng = lngSum / count;

    const newLocation = {
      lat: averageLat.toFixed(5),
      lng: averageLng.toFixed(5),
    };

    setMyLocation(newLocation);

    if (areaCenterRef.current) {
      const myDist = approximateDistance(
        myLocationRef.current.lat,
        myLocationRef.current.lng,
        areaCenterRef.current.lat,
        areaCenterRef.current.lng
      );
      setDistance(myDist);
    }

    if (targetLocationRef.current) {
      const targetDist = approximateDistance(
        myLocationRef.current.lat,
        myLocationRef.current.lng,
        targetLocationRef.current.lat,
        targetLocationRef.current.lng
      );
      setDistToTarget(targetDist);
    }
  };

  // 내 위치를 잡고, 거리를 계산하는 함수
  const fetchLocation = async () => {
    let latSum = 0;
    let lngSum = 0;
    let count = 0;

    const successCallback = position => {
      const { latitude, longitude } = position.coords;
      latSum += latitude;
      lngSum += longitude;
      count += 1;

      if (count === GET_POSITION_COUNT) {
        calculationAverageLocation(latSum, lngSum, count);
      }
    };

    const errorCallback = error => {
      console.log(error);
    };

    const positionPromises = [];
    for (let i = 0; i < GET_POSITION_COUNT; i++) {
      positionPromises.push(
        new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            position => {
              successCallback(position);
              resolve();
            },
            error => {
              errorCallback(error);
              resolve();
            }
          );
        })
      );
    }
    await Promise.all(positionPromises);
  };

  // gameRoomId 값에 변동이 있다면 sessionStorage에 저장
  // 기본적으로 /room 접속 시 useParams 활용해 gameRoomId를 세팅하나, 새로고침 등을 대비해 sessionStorage에 저장
  useEffect(() => {
    if (gameRoomId) {
      sessionStorage.setItem("gameRoomId", gameRoomId);
    }
  }, [gameRoomId]);

  // /game-play/:gameRoomId 페이지에 있을 때 내 위치를 실시간으로 변경
  const location = useLocation();

  useEffect(() => {
    const isGamePlayPage = location.pathname.includes(
      `/game-play/${gameRoomId}`
    );
    if (!isGamePlayPage || !navigator.geolocation) return;

    const intervalId = setInterval(fetchLocation, 1000); // 1초마다 내 위치 및 거리 계산 함수 실행

    return () => clearInterval(intervalId);
  }, [location.pathname]);

  return (
    <GameContext.Provider
      value={{
        gameRoomId,
        setGameRoomId,
        gameRoomUsers,
        setGameRoomUsers,
        targetId,
        setTargetId,
        gameStatus,
        setGameStatus,
        isGameRoomLoading,
        setIsGameRoomLoading,
        isAlive,
        setIsAlive,
        myLocation,
        setMyLocation,
        targetLocation,
        setTargetLocation,
        areaCenter,
        setAreaCenter,
        areaRadius,
        setAreaRadius,
        distance,
        setDistance,
        distToTarget,
        setDistToTarget,
        missionList,
        setMissionList,
        itemList,
        setItemList,
        playerCount,
        setPlayerCount,
        toOffChatting,
        setToOffChatting,
        username,
        blockGPS,
        setBlockGPS,
        blockScreen,
        setBlockScreen,
        distToCatch,
        setDistToCatch,
        DISTANCE_TO_CATCH,
        DISTANCE_ENHANCED_BULLET,
        bullet,
        setBullet,
        blockGPSCount,
        setBlockGPSCount,
        blockScreenCount,
        setBlockScreenCount,
        enhancedBulletCount,
        setEnhancedBulletCount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
