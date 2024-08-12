package com.boricori.service;


import com.boricori.dto.ItemCount;
import com.boricori.dto.GameResult;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.Item;
import com.boricori.entity.Mission;
import com.boricori.entity.User;

import java.util.List;

public interface InGameService {

  List<Mission> assignMissions(String username, Long gameId);

  Mission changeMission(Long gameId, String username, long missionId);

  GameParticipants completeMission(Long roomId, String username, long missionId);

  Item getItem(GameParticipants player);

  void useItem(Long roomId, String username, long itemId);

  void catchTarget(User user, User target, long gameId);

  GameParticipants checkIfPlayer(String username, long gameId);

  List<Mission> getMissions(GameParticipants player);

  List<ItemCount> getPlayerItems(GameParticipants player);

  void stopPlaying(String username, String roomId);

  void rejoin(String username, String roomId);

  void eliminateUser(String username, long roomId);

  Mission getMissionById(long missionId);

  void addGamePlayerScore(long gameId);

  GameResult finishGameAndHandleLastTwoPlayers(long gameId);

  void finishGame(long gameId);

  // redis expired = 4 일 때, 타임아웃 종료
  GameResult gameTimeout(long gameId);
}
