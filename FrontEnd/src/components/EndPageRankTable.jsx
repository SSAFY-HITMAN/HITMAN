import { Card } from "@/components/ui/Card";

const EndPageRankTable = () => {
  // 랭킹 관련 로직 추가
  // 임시 목록
  const rankingList = [
    {
      id: "Bill Rizer",
      rank: 1,
    },
    {
      id: "Genbei Yagy",
      rank: 2,
    },
    {
      id: "Lancy Neo",
      rank: 3,
    },
    {
      id: "Konami",
      rank: 4,
    },
  ];

  return (
    <div>
      <div id="game-result" className="my-5 flex flex-col items-center">
        <Card className="flex w-[90vw] flex-col items-center rounded-lg border-2 border-black">
          <h1 className="my-4 text-3xl font-bold">게임 결과</h1>
          {rankingList.map((user, idx) => (
            <Card
              key={idx}
              className="my-1 w-[90%] rounded-lg border-2 border-black"
            >
              {user.rank === 1 && (
                <h1 id="winner" className="text-center text-3xl font-bold">
                  Winner!
                </h1>
              )}
              <div id="player-result" className="flex h-[10vh]">
                <div id="player-profile" className="m-2 border-2 w-[30%]">
                  <img
                    src=""
                    alt="profile-image"
                  />
                </div>
                <div
                  id="player-name"
                  className="mx-4 flex w-[65%] items-center justify-center text-2xl font-bold"
                >
                  {user.id}
                </div>
                {user.rank !== 1 && (
                  <div
                    id="player-rank"
                    className="m-2 flex flex-col justify-center text-2xl font-bold"
                  >
                    {user.rank}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default EndPageRankTable;
