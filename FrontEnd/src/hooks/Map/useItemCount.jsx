import { useState, useEffect, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const ITEM_IDS = {
  BLOCK_GPS: 1,
  BLOCK_SCREEN: 2,
  ENHANCED_BULLET: 3,
};

const useItemCount = () => {
  const {
    itemList,
    setBlockGPSCount,
    setBlockScreenCount,
    setEnhancedBulletCount,
  } = useContext(GameContext);

  // 1. 스텔스 망토 blockGPSCount
  // 2. 방해 폭탄 blockScreenCount
  // 3. 강화 총알 enhancedBulletCount

  // itemList 최신화 시(axios response) 갱신
  useEffect(() => {
    if (!itemList || itemList.length === 0) return; // itemList가 비어있으면 실행하지 않음

    const blockGPSItem = itemList.find(
      item => item.itemId == ITEM_IDS.BLOCK_GPS
    ); // 스텔스 망토의 itemId
    const blockScreenItem = itemList.find(
      item => item.itemId == ITEM_IDS.BLOCK_SCREEN
    ); // 방해 폭탄의 itemId
    const enhancedBulletItem = itemList.find(
      item => item.itemId == ITEM_IDS.ENHANCED_BULLET
    ); // 강화 총알의 itemId

    setBlockGPSCount(blockGPSItem ? parseInt(blockGPSItem.count, 10) : 0);
    setBlockScreenCount(
      blockScreenItem ? parseInt(blockScreenItem.count, 10) : 0
    );
    setEnhancedBulletCount(
      enhancedBulletItem ? parseInt(enhancedBulletItem.count, 10) : 0
    );
  }, [itemList]);

  // 아이템 획득
  // 총알 1개 고정(useBullet.jsx) + 아이템 1개
  const getItem = itemId => {
    switch (itemId) {
      case ITEM_IDS.BLOCK_GPS:
        setBlockGPSCount(prev => prev + 1);
        break;
      case ITEM_IDS.BLOCK_SCREEN:
        setBlockScreenCount(prev => prev + 1);
        break;
      case ITEM_IDS.ENHANCED_BULLET:
        setEnhancedBulletCount(prev => prev + 1);
        break;
      default:
        break;
    }
  };

  // 아이템 사용
  const useItem = itemId => {
    switch (itemId) {
      case ITEM_IDS.BLOCK_GPS:
        setBlockGPSCount(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case ITEM_IDS.BLOCK_SCREEN:
        setBlockScreenCount(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case ITEM_IDS.ENHANCED_BULLET:
        setEnhancedBulletCount(prev => (prev > 0 ? prev - 1 : 0));
        break;
      default:
        break;
    }
  };

  return {
    getItem,
    useItem,
  };
};

export default useItemCount;
