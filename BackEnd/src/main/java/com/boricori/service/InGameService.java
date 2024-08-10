package com.boricori.service;

import com.boricori.dto.request.inGame.MissionChangeRequest;
import com.boricori.dto.request.inGame.UseItemRequest;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.Item;
import com.boricori.entity.Mission;
import com.boricori.entity.User;
import java.util.List;

public interface InGameService {

  List<Mission> assignMissions(String username, Long gameId);

  Mission changeMission(Long gameId, String username, long missionId);

  void completeMission(Long roomId, String username, long missionId);

  Item getItem(Long gameId, String username);

  void useItem(Long roomId, String username, long itemId);

  void catchTarget(User user, User target, long gameId);

  GameParticipants checkIfPlayer(String username, long gameId);

  List<Mission> getMissions(GameParticipants player);

  List<Item> getItems(GameParticipants player);

  GameParticipants getUserInfo(Long gameId, String username);

  List<EndGameUserInfoResponse> getDrawEndGameUsersInfo(Long gameIf, String usernameA, String usernameB);

  List<EndGameUserInfoResponse> getWinEndGameUsersInfo(Long gameIf, String usernameA);

  void stopPlaying(String username, String roomId);

  void rejoin(String username, String roomId);

  void killUser(String username, long roomId);

}
