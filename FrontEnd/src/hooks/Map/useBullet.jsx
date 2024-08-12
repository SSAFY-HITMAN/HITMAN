import { useState } from "react";

const useBullet = () => {
  const [bullet, setBullet] = useState(() => {
    const savedBullet = sessionStorage.getItem("bullet");
    return savedBullet !== null ? parseInt(savedBullet, 10) : 0;
  }); // 총알 수
  const [isCooldown, setIsCooldown] = useState(false); // 재사용 대기시간 여부
  const COOLDOWN = 3000; // 재발사 시간 3초

  const getBullet = (n) => {
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

  return { bullet, isCooldown, getBullet, shootBullet };
};

export default useBullet;
