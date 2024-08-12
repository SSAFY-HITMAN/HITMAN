import { Card } from "@/components/ui/Card";

const EndPageRankTable = () => {
  const winner1 = sessionStorage.getItem("winner1");
  const winner2 = sessionStorage.getItem("winner2");
  const rankingList = JSON.parse(sessionStorage.getItem("result")) || [];

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
              {(user.userName === winner1 || user.userName === winner2) && (
                <h1
                  id="winner"
                  className="flex justify-center text-center text-3xl font-bold"
                >
                  🏆
                  <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Winner!
                  </div>
                </h1>
              )}
              <div id="player-result" className="flex h-[10vh]">
                {user.userName !== winner1 && user.userName !== winner2 ? (
                  <div
                    id="player-rank-other"
                    className={`m-2 flex w-[10%] flex-col justify-center text-center text-2xl font-bold ${
                      idx + 1 === 2
                        ? "rounded-full bg-gray-400 text-white" // 은메달
                        : idx + 1 === 3
                          ? "rounded-full bg-yellow-800 text-white" // 동메달
                          : ""
                    }`}
                  >
                    {idx + 1}
                  </div>
                ) : (
                  <div
                    id="player-rank-winner"
                    className="m-2 flex w-[10%] flex-col justify-center text-center text-2xl font-bold"
                  >
                    {/* {idx + 1} */}
                  </div>
                )}
                <div
                  id="player-name"
                  className="mx-4 flex w-[45%] items-center justify-center text-xl font-bold"
                >
                  {user.userName}
                </div>
                <div
                  id="player-kill-missions"
                  className="flex w-[25%] flex-col justify-center text-center text-xl font-bold"
                >
                  <div>
                    <span className="mr-1">💀</span> {user.kills}
                  </div>
                  <div>
                    <span className="mr-1">⭐</span> {user.missionComplete}
                  </div>
                </div>
                <div
                  id="player-game-info"
                  className="text-l mx-1 flex w-[20%] flex-col items-center justify-center text-xl font-bold"
                >
                  <div id="player-plus-score">+{user.score}</div>
                </div>
              </div>
            </Card>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default EndPageRankTable;
