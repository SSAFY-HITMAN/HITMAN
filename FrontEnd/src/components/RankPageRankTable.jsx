import { useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";

const RankPageTable = ({ rankingList }) => {
  const rankList = JSON.stringify(rankingList);
  const jsonObject = JSON.parse(rankList).rankingList;

  const [searchTerm, setSearchTerm] = useState("");
  const filteredList = jsonObject.filter(user =>
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div
        id="rank"
        className="flex h-screen flex-col items-center justify-center"
      >
        <div className="flex w-full flex-col items-center">
          <h1 className="mb-8 text-4xl font-bold">
            <span className="bg-gradient-to-r from-rose-700 to-rose-200 bg-clip-text text-transparent">
              HITMAN
            </span>{" "}
            순위
          </h1>
          <input
            type="text"
            placeholder="닉네임 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 w-[85%] rounded-lg p-3 text-black"
          />
          <ScrollArea className="h-[75vh] w-[85%] flex-col items-center rounded-lg border-2 bg-white font-medium">
            {filteredList.map((user, idx) => (
              <>
                <div
                  key={idx}
                  id="rank-row"
                  className={`flex h-full w-full flex-row p-2 ${
                    idx + 1 === 1
                      ? "h-[16vh] bg-gradient-to-br from-yellow-200 to-yellow-500 text-4xl font-black" // 금메달
                      : idx + 1 === 2
                        ? "bg-gradient-to-br from-gray-200 to-gray-500 text-xl" // 은메달
                        : idx + 1 === 3
                          ? "bg-gradient-to-br from-yellow-500 to-yellow-800 text-xl" // 동메달
                          : "text-lg text-black"
                  }`}
                >
                  <span
                    id="rank-number"
                    className={`m-2 flex w-[15%] items-center justify-center ${idx + 1 === 1 && "animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] bg-clip-text text-transparent"}`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    id="nickname"
                    className={`flex w-[60%] items-center justify-center ${idx + 1 === 1 && "animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] bg-clip-text text-transparent"}`}
                  >
                    {user.id}
                  </span>
                  <span
                    id="score"
                    className="flex items-center justify-center text-sm"
                  >
                    🎖️ {user.score.toLocaleString()}
                  </span>
                </div>
                <Separator />
              </>
            ))}
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default RankPageTable;
