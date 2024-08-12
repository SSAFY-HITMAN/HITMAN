import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance.js";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

const ProfileDialog = ({ isOpen, onClose, apiPath, isMyProfile }) => {
  const [profileData, setProfileData] = useState(null);
  const { username, email, playtime, profilePic } = profileData || {};

  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          const response = await axiosInstance.get(apiPath);
          if (response.status === 200) {
            setProfileData(response.data);
          } else {
            alert("프로필 정보를 가져오는데 실패했습니다.");
          }
        } catch (err) {
          // console.error("Error fetching profile:", err);
          // alert(
          //   "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
          // );
        }
      };

      fetchProfile();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-auto w-[80%] rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isMyProfile === "true" ? "내 정보" : "유저 정보"}
          </DialogTitle>
        </DialogHeader>
        <hr />
        <div className="flex flex-col items-center justify-center">
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

export default ProfileDialog;
