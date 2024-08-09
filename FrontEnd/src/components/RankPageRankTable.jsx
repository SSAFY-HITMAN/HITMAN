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
                <div id="player-profile" className="m-2 w-[25%] border-2">
                  <img src="" alt="profile-image" />
                </div>
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
                    {user.score}
                  </div>
                </div>
                <div
                  id="player-rank"
                  className="m-2 flex h-[80%] w-[15%] items-center justify-center rounded-lg border-2"
                >
                  <span className="text-2xl font-bold">{user.rank}</span>
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
