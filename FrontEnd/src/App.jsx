import React from "react";
import { Routes, Route } from "react-router-dom";

import Onboarding from "./pages/user/Onboarding";
import Login from "./pages/user/Login";
import KakaoLogin from "./pages/user/KakaoLogin";
import GoogleLogin from "./pages/user/GoogleLogin";
import SetUsername from "./pages/user/SetUsername";
import Signup from "./pages/user/Signup";

import Home from "./pages/Home";
import Room from "./pages/Room";
import RoomNumber from "./pages/RoomNumber";
import GamePlay from "./pages/GamePlay";
import CamChatting from "./pages/CamChatting";
import PrivateChatting from "./pages/PrivateChatting";
import Ending from "./pages/Ending";
import Rank from "./pages/Rank";
import { GameProvider } from "@/context/GameContext";
import { WebSocketProvider } from "./context/WebSocketContext";

// /room과 /game-play에서만 WebSocket이 동작하도록 설정
const GameRoutes = () => (
  <GameProvider>
    <WebSocketProvider>
      <Routes>
        <Route path="/room/:gameRoomId" element={<Room />} />
        <Route path="/game-play/:gameRoomId" element={<GamePlay />} />
      </Routes>
    </WebSocketProvider>
  </GameProvider>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/kakao" element={<KakaoLogin />} />
      <Route path="/auth/google" element={<GoogleLogin />} />
      <Route path="/auth/setUsername" element={<SetUsername />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/room-number" element={<RoomNumber />} />
      <Route path="/cam-chatting" element={<CamChatting />} />
      <Route path="/private-chatting" element={<PrivateChatting />} />
      <Route path="/ending/:gameRoomId" element={<Ending />} />
      <Route path="/rank" element={<Rank />} />
      <Route path="/*" element={<GameRoutes />} />
    </Routes>
  );
};

export default App;
