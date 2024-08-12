import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance";

const DISTANCE_TO_CATCH = 5; // 잡기 버튼이 활성화되기 위한 타겟과의 거리

const useCatchTarget = () => {
  const { gameRoomId, distToTarget } = useContext(GameContext);
  const [isAbleToCatchTarget, setIsAbleToCatchTarget] = useState(false);
  const catchTimeoutRef = useRef(null);

  // locationing이 튀는 현상 때문에 잡기 버튼이 불필요하게 활성화 상태가 변화하는 것을 보정하기 위함
  // 한번 활성화되면 GPS가 튀어 상대가 범위를 벗어나더라도 2초간은 버튼 클릭을 할 수 있도록 함
  const countCatchTimeout = useCallback(() => {
    // 초기 mount시 버튼 활성화 방지
    if (distToTarget !== null) {
      setIsAbleToCatchTarget(true);
      catchTimeoutRef.current = setTimeout(() => {
        setIsAbleToCatchTarget(false);
        catchTimeoutRef.current = null;
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (distToTarget < DISTANCE_TO_CATCH) {
      if (catchTimeoutRef.current !== null) {
        clearTimeout(catchTimeoutRef.current);
      }
      countCatchTimeout();
    }

    return () => {
      clearTimeout(catchTimeoutRef.current);
    };
  }, [distToTarget]);

  const handleOnClickCatchTarget = async () => {
    try {
      // 잡기 관련 로직 추가
      const response = await axiosInstance.patch(
        `/in-game/${gameRoomId}/catchTarget`
      );
      if (response.status === 200) {
        console.log("Target caught successfully!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { isAbleToCatchTarget, handleOnClickCatchTarget };
};

export default useCatchTarget;
