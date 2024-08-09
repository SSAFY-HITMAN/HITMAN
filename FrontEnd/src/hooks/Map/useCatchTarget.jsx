import { useState, useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import axiosInstance from "@/api/axiosInstance";

const useCatchTarget = () => {
  const DISTANCE_TO_CATCH = 5; // 잡기 버튼이 활성화되기 위한 타겟과의 거리
  const { gameRoomId, isAlive, distToTarget } = useContext(GameContext);
  const [isAbleToCatchTarget, setIsAbleToCatchTarget] = useState(false);
  const catchTimeoutRef = useRef(null);

  const handleOnClickCatchTarget = async () => {
    try {
      // 잡기 관련 로직 추가
      const response = await axiosInstance.post(
        `/in-game/${gameRoomId}/catchTarget`
      );
      if (response.status === 200) {
        alert("Target caught successfully!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // locationing이 튀는 현상 때문에 잡기 버튼이 불필요하게 활성화 상태가 변화하는 것을 보정하기 위함
    // 한번 활성화되면 GPS가 튀어 상대가 범위를 벗어나더라도 2초간은 버튼 클릭을 할 수 있도록 함
    const countCatchTimeout = () => {
      if (isAlive && distToTarget >= 0) {
        setIsAbleToCatchTarget(true);
        catchTimeoutRef.current = setTimeout(() => {
          setIsAbleToCatchTarget(false);
          catchTimeoutRef.current = null;
        }, 2000);
      }
    };

    if (isAlive && distToTarget < DISTANCE_TO_CATCH) {
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
  }, [distToTarget, isAlive]);

  return { isAbleToCatchTarget, handleOnClickCatchTarget };
};

export default useCatchTarget;
