import { useState } from "react";
import { Card } from "@/components/ui/Card";

const RankPageTable = ({ rankingList }) => {
  const rankList = JSON.stringify(rankingList);
  const jsonObject = JSON.parse(rankList).rankingList;

  const [searchTerm, setSearchTerm] = useState("");
  const filteredList = jsonObject.filter(user =>
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div id="rank" className="my-5 flex flex-col items-center">
        <div className="flex w-[90vw] flex-col items-center">
          <h1 className="my-4 text-3xl font-bold">Ranking</h1>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 w-[90%] rounded-lg border-2 border-black p-2"
          />
          {filteredList.map((user, idx) => (
            <Card
              key={idx}
              className="my-1 h-[10vh] w-[90%] rounded-lg border-2 border-black"
            >
              <div id="player-result" className="flex h-[100%]">
                <div className="mx-4 flex w-[65%] flex-col">
                  <div
                    id="player-id"
                    className="flex h-[65%] items-center justify-center text-2xl font-bold"
                  >
                    {user.id}
                  </div>
                  <div
                    id="player-score"
                    className="text-l h-[35%] text-center font-bold"
                  >
                    🎖️ {user.score.toLocaleString()}
                  </div>
                </div>
                <div
                  id="player-rank"
                  className={`m-2 flex h-[80%] w-[15%] items-center justify-center rounded-lg text-3xl font-bold ${
                    idx + 1 === 1
                      ? "bg-gradient-to-br from-yellow-200 to-yellow-600 text-white" // 금메달
                      : idx + 1 === 2
                        ? "bg-gradient-to-br from-gray-200 to-gray-600 text-white" // 은메달
                        : idx + 1 === 3
                          ? "bg-gradient-to-br from-yellow-600 to-yellow-900 text-white" // 동메달
                          : ""
                  }`}
                >
                  {idx + 1}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default RankPageTable;
