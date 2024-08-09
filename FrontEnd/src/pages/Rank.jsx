import useGetRank from "@/hooks/Rank/useGetRank";
import RankPageRankTable from "@/components/RankPageRankTable";

const Rank = () => {
  const rankingList = useGetRank();

  return (
    <>
      <RankPageRankTable rankingList={rankingList} />
    </>
  );
};

export default Rank;
