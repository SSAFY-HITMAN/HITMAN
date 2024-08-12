import { useState } from "react";

const useBullet = () => {
  const [bullet, setBullet] = useState(() => {
    const savedBullet = sessionStorage.getItem("bullets");
    return savedBullet !== null ? parseInt(savedBullet, 10) : 0;
  }); // 총알 수
  const [isCooldown, setIsCooldown] = useState(false); // 재사용 대기시간 여부
  const COOLDOWN = 3000; // 재발사 시간 3초

  const getBullet = n => {
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
