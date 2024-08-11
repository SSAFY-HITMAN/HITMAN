import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";

const useGetRank = () => {
  const [rankingList, setRankingList] = useState([
    {
      id: "Bill Rizer",
      score: 1050,
    },
    {
      id: "Genbei Yagy",
      score: 90,
    },
    {
      id: "Lancy Neo",
      score: 80,
    },
    {
      id: "Konami",
      score: 70,
    },
    {
      id: "한국인",
      score: 50,
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
