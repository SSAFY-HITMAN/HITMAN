import { useState, useEffect, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const useBullet = () => {
  const { bullet, setBullet } = useContext(GameContext);

  const [isCooldown, setIsCooldown] = useState(false); // 재사용 대기시간 여부
  const COOLDOWN = 3000; // 재발사 시간 3초

  useEffect(() => {
    // bullet 상태가 변경될 때마다 sessionStorage에 저장
    sessionStorage.setItem("bullets", bullet);
  }, [bullet]);

  const getBullet = n => {
    console.log(`getBullet: +${n}`);
    setBullet(prev => prev + n);
  };

  const shootBullet = () => {
    if (!isCooldown && bullet > 0) {
      setBullet(prev => prev - 1);
      setIsCooldown(true);
      setTimeout(() => {
        setIsCooldown(false);
      }, COOLDOWN);
    }
  };

  // catchTarget 시 타겟 총알까지 합산해 가져옴 (BE에서 합산)
  const getBulletByCatchTarget = n => {
    setBullet(n);
  };

  return { bullet, isCooldown, getBullet, shootBullet, getBulletByCatchTarget };
};

export default useBullet;
