import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

// avatar 이미지 모두 가져오기
const importAllImages = import.meta.glob("@/assets/avatar/*.{jpg,jpeg}");
const images = [];
for (const path in importAllImages) {
  importAllImages[path]().then(module => {
    images.push({ path, module: module.default });
  });
}

const UserProfileDialog = ({ isOpen, onClose, userId }) => {
  const [profileData, setProfileData] = useState(null);
  const { username, email, playtime } = profileData || {};
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          const response = await axiosInstance.get(`/user/profile/${userId}`);
          if (response.status === 200) {
            setProfileData(response.data);
          } else {
            alert("프로필 정보를 가져오는데 실패했습니다.");
          }
        } catch (err) {
          // 에러 처리 로직
        }
      };

      fetchProfile();
    }
  }, [isOpen, userId]);

  const selectRandomImage = () => {
    if (images.length > 0) {
      const randomImage =
        images[Math.floor(Math.random() * images.length)].module;

      // profile_pictures 객체를 가져오기
      let storedProfilePics =
        JSON.parse(localStorage.getItem("profile_pictures")) || {};

      // 해당 사용자에 대한 프로필 이미지 경로 설정
      storedProfilePics[userId] = randomImage;

      // 업데이트된 객체를 다시 localStorage에 저장
      localStorage.setItem(
        "profile_pictures",
        JSON.stringify(storedProfilePics)
      );

      // 상태 업데이트
      setProfilePic(randomImage);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // profile_pictures 객체에서 해당 사용자의 프로필 이미지 경로 가져오기
      const storedProfilePics =
        JSON.parse(localStorage.getItem("profile_pictures")) || {};

      if (storedProfilePics[userId]) {
        setProfilePic(storedProfilePics[userId]);
      } else {
        selectRandomImage();
      }
    }
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-auto w-[80%] rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-lg">유저 정보</DialogTitle>
        </DialogHeader>
        <hr />
        <div className="relative flex flex-col items-center justify-center">
          <Avatar className="mb-4 h-32 w-32">
            <AvatarImage src={profilePic} alt="avatar" />
            <AvatarFallback>{username}</AvatarFallback>
          </Avatar>
          <div className="mb-8 text-2xl font-bold">{username}</div>
          <div>
            <span className="font-extrabold">이메일&nbsp;&nbsp;&nbsp;</span>
            {email}
          </div>
          <div>
            <span className="font-extrabold">
              총 플레이 시간&nbsp;&nbsp;&nbsp;
            </span>{" "}
            {playtime} 분
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
