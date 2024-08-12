import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";

const useGetRank = () => {
  const [rankingList, setRankingList] = useState([
    {
      id: "강해린",
      score: 1050,
    },
    {
      id: "다니엘",
      score: 100,
    },
    {
      id: "김민지",
      score: 90,
    },
    {
      id: "하니",
      score: 80,
    },
    {
      id: "이혜인",
      score: 70,
    },
    {
      id: "카리나",
      score: 60,
    },
    {
      id: "윈터",
      score: 50,
    },
    {
      id: "닝닝",
      score: 40,
    },
    {
      id: "지젤",
      score: 30,
    },
    {
      id: "안유진",
      score: 20,
    },
    {
      id: "장원영",
      score: 20,
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosInstance.get("/user/ranks");
        if (response.status == 200) {
          const data = response.data;
          setRankingList(data);
        } else {
          alert(
            "랭킹 조회 요청에 대한 응답 수신에 실패했습니다. 나중에 다시 시도해주세요."
          );
        }
      } catch {
        alert("랭킹 조회 요청을 보낼 수 없습니다. 나중에 다시 시도해주세요.");
      }
    })();
  }, []);

  return { rankingList };
};

export default useGetRank;
