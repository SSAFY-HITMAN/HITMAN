import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

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

const GameRoutes = () => (
  <GameProvider>
    <WebSocketProvider>
      <Routes>
        <Route path="/room/:gameRoomId" element={<Room />} />
        <Route path="/game-play/:gameRoomId" element={<GamePlay />} />
        <Route path="/cam-chatting" element={<CamChatting />} />
        <Route path="/private-chatting" element={<PrivateChatting />} />
      </Routes>
    </WebSocketProvider>
  </GameProvider>
);

const App = () => {
  const location = useLocation();

  return (
    <div className="bg-theme-color min-h-screen text-white">
      <TransitionGroup>
        <CSSTransition key={location.key} classNames="page" timeout={300}>
          <Routes location={location}>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/kakao" element={<KakaoLogin />} />
            <Route path="/auth/google" element={<GoogleLogin />} />
            <Route path="/auth/setUsername" element={<SetUsername />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/room-number" element={<RoomNumber />} />
            <Route path="/ending/:gameRoomId" element={<Ending />} />
            <Route path="/rank" element={<Rank />} />
            <Route path="/*" element={<GameRoutes />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default App;
