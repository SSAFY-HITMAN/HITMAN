import { useContext } from "react";
import { GameContext } from "@/context/GameContext";

const GameRoomUsers = () => {
  const { gameRoomUsers } = useContext(GameContext);

  return (
    <>
      <ul className="mb-8">
        {gameRoomUsers.map((user, index) => (
          <li key={index}>{user.username}</li>
        ))}
      </ul>
    </>
  );
};

export default GameRoomUsers;
