import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
import GoBackButton from "@/components/GoBackButton";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import useGetRank from "@/hooks/Rank/useGetRank";

// avatar 이미지 모두 가져오기
const importAllImages = import.meta.glob("@/assets/avatar/*.{jpg,jpeg}");
let images = [];
for (const path in importAllImages) {
  importAllImages[path]().then(module => {
    images.push(module.default);
  });
}

const Rank = () => {
  const rankingList = useGetRank();
  const rankList = JSON.stringify(rankingList);
  const jsonObject = (JSON.parse(rankList)?.rankingList || []).map(user => ({
    id: user?.id || "Unknown",
    ...user,
  })); // undefined 에러 회피
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userAvatars, setUserAvatars] = useState({});

  useEffect(() => {
    if (!jsonObject || !Array.isArray(jsonObject)) {
      console.error("jsonObject is not an array or is undefined");
      return;
    }

    const loadUserAvatars = () => {
      const storedProfilePics =
        JSON.parse(localStorage.getItem("profile_pictures")) || {};
      const avatars = {};

      jsonObject.forEach((user, idx) => {
        if (storedProfilePics[user.id]) {
          avatars[user.id] = storedProfilePics[user.id];
        } else {
          // 순서에 따른 이미지 할당
          const assignedImage = images[idx % images.length]; // 순서대로 이미지를 할당
          if (assignedImage) {
            avatars[user.id] = assignedImage;
            storedProfilePics[user.id] = assignedImage;
          }
        }
      });

      // 업데이트된 객체를 다시 localStorage에 저장
      localStorage.setItem(
        "profile_pictures",
        JSON.stringify(storedProfilePics)
      );
      setUserAvatars(avatars);
    };

    if (images.length > 0 && jsonObject.length > 0) {
      loadUserAvatars();
    }
  }, [images, jsonObject]);

  const filteredList = jsonObject
    .filter(user => user && user.id) // user와 user.id가 정의되어 있는지 확인
    .filter(user => user.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const winnerClass = idx =>
    searchTerm === "" && idx + 1 === 1
      ? "animate-gradient-move bg-gradient-rainbow bg-[length:200%_200%] bg-clip-text text-transparent"
      : "";

  const top3Class = idx => {
    // 검색결과가 순위처럼 나오는 것 방지
    if (searchTerm !== "") return "text-lg text-black";

    switch (idx + 1) {
      case 1: // 금메달
        return "h-[16vh] bg-gradient-to-br from-yellow-200 to-yellow-500 text-3xl font-black";
      case 2: // 은메달
        return "bg-gradient-to-br from-gray-200 to-gray-500 text-xl";
      case 3: // 동메달
        return "bg-gradient-to-br from-yellow-500 to-yellow-800 text-xl";
      default:
        return "text-lg text-black";
    }
  };

  const handleReadProfile = async userId => {
    setSelectedUserId(userId);
    setIsProfileDialogOpen(true);
  };

  return (
    <>
      <div
        id="rank"
        className="flex h-screen flex-col items-center justify-center"
      >
        <GoBackButton to="/home" />
        <div className="flex w-full flex-col items-center">
          <div className="m-8 flex items-center justify-center text-4xl font-bold">
            <span className="mr-4 bg-gradient-to-r from-rose-700 to-rose-200 bg-clip-text text-transparent">
              HITMAN
            </span>
            순위
          </div>
          <input
            type="text"
            placeholder="닉네임 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 w-[85%] rounded-lg p-3 text-black"
          />
          <ScrollArea className="h-[70vh] w-[85%] flex-col items-center rounded-lg border-2 bg-white font-medium">
            {filteredList.map((user, idx) => (
              <>
                <div
                  key={user.id}
                  id="rank-row"
                  className={`flex h-full w-full flex-row p-2 ${top3Class(
                    idx
                  )}`}
                  onClick={() => handleReadProfile(user.id)}
                >
                  <span
                    id="rank-number"
                    className={`m-2 flex w-[15%] items-center justify-center ${winnerClass(
                      idx
                    )}`}
                  >
                    {idx + 1}
                  </span>
                  <Avatar className="m-2 h-8 w-8">
                    <AvatarImage src={userAvatars[user.id]} alt={user.id} />
                    <AvatarFallback>
                      {user.id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    id="nickname"
                    className={`flex w-[45%] items-center justify-center ${winnerClass(
                      idx
                    )}`}
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
                {isProfileDialogOpen && selectedUserId === user.id && (
                  <UserProfileDialog
                    isOpen={isProfileDialogOpen}
                    onClose={() => setIsProfileDialogOpen(false)}
                    userId={user.id}
                  />
                )}
              </>
            ))}
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default Rank;
