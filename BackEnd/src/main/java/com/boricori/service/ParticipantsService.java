package com.boricori.service;

import com.boricori.dto.request.gameroom.PlayerInfoRequest;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.User;
import java.util.List;

public interface ParticipantsService {

  List<User> makeGameParticipant(GameRoom gameRoom, List<PlayerInfoRequest> playerInfoRequests);

  void addRecord(GameParticipants participants);

  public GameRoom getPlaying(String username);

}
