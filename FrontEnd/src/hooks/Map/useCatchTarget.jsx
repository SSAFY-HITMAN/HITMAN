import { useState, useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance";
import useBullet from "@/hooks/Map/useBullet";

const useCatchTarget = () => {
  const {
    gameRoomId,
    isAlive,
    distToTarget,
    setItemList,
    username,
    distToCatch,
    setDistToCatch,
    DISTANCE_TO_CATCH,
    DISTANCE_ENHANCED_BULLET,
  } = useContext(GameContext);
  const { getBulletByCatchTarget } = useBullet();
  const [isAbleToCatchTarget, setIsAbleToCatchTarget] = useState(false);
  const catchTimeoutRef = useRef(null);

  const handleUseEnhancedBullet = () => {
    sessionStorage.setItem("effectStartTime", Date.now());
    sessionStorage.setItem("effectExpirationTime", Date.now() + 30 * 1000);
    sessionStorage.setItem("itemInEffect", "enhancedBullet");
    setDistToCatch(DISTANCE_ENHANCED_BULLET);
    alert("강화 총알 사용");
    setTimeout(() => {
      setDistToCatch(DISTANCE_TO_CATCH);
      const itemInEffect = sessionStorage.getItem("itemInEffect");
      if (itemInEffect === "enhancedBullet") {
        sessionStorage.removeItem("effectStartTime");
        sessionStorage.removeItem("effectExpirationTime");
        sessionStorage.removeItem("itemInEffect");
      }
    }, 30 * 1000);
  };

  const handleAdditionalRequest = async () => {
    try {
      const additionalResponse = await axiosInstance.get(`/in-game/init/${gameRoomId}`);
      if (additionalResponse.status == 200) {
        const metadata = additionalResponse.data;

        // 총알 합산 갱신
        const newBullet = parseInt(metadata.bullets, 10);
        getBulletByCatchTarget(newBullet);

        // 아이템 합산 갱신
        setItemList(metadata.myItems);
      } else {
        console.log(`아이템을 가져오는 중 문제가 발생했습니다: ${additionalResponse.status}`);
      }
    } catch (error) {
      console.log(`아이템을 가져오지 못했습니다: ${error}`);
    }
  };

  const handleOnClickCatchTarget = async () => {
    try {
      // 잡기 관련 로직 추가
      const response = await axiosInstance.post(`/in-game/catchTarget`, {
        username: username,
        gameId: gameRoomId,
      });
      if (response.status == 200) {
        alert("Target caught successfully!");
        await handleAdditionalRequest();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAlive || distToTarget > distToCatch) return;

    // locationing이 튀는 현상 때문에 잡기 버튼이 불필요하게 활성화 상태가 변화하는 것을 보정하기 위함
    // 한번 활성화되면 GPS가 튀어 상대가 범위를 벗어나더라도 2초간은 버튼 클릭을 할 수 있도록 함
    const countCatchTimeout = () => {
      setIsAbleToCatchTarget(true);
      catchTimeoutRef.current = setTimeout(() => {
        setIsAbleToCatchTarget(false);
        catchTimeoutRef.current = null;
      }, 2000);
    };

    // 타겟과 거리가 가까울 때 이미 타이머가 설정되어 있다면 갱신
    if (distToTarget <= distToCatch) {
      if (catchTimeoutRef.current !== null) {
        clearTimeout(catchTimeoutRef.current);
      }
      countCatchTimeout();
    }

    return () => {
      if (catchTimeoutRef.current !== null) {
        clearTimeout(catchTimeoutRef.current);
      }
    };
  }, [distToTarget, distToCatch, isAlive]);

  return {
    isAbleToCatchTarget,
    handleOnClickCatchTarget,
    handleUseEnhancedBullet,
  };
};

export default useCatchTarget;
