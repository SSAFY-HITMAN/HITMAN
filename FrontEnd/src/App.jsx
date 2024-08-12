import React from "react";
import { Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Room from "./pages/Room";
import RoomNumber from "./pages/RoomNumber";
import GamePlay from "./pages/GamePlay";
import CamChatting from "./pages/CamChatting";
import PrivateChatting from "./pages/PrivateChatting";
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
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/room-number" element={<RoomNumber />} />
      <Route path="/cam-chatting" element={<CamChatting />} />
      <Route path="/private-chatting" element={<PrivateChatting />} />
      <Route path="/*" element={<GameRoutes />} />
    </Routes>
  );
};

export default App;
