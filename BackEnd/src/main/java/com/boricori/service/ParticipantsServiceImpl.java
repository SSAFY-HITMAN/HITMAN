package com.boricori.service;

import com.boricori.dto.request.gameroom.PlayerInfoRequest;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.User;
import com.boricori.repository.ParticipantRepo.ParticipantRepository;
import com.boricori.repository.ParticipantRepo.ParticipantRepositoryImpl;
import com.boricori.repository.userRepo.UserRepositoryImpl;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ParticipantsServiceImpl implements ParticipantsService {

  @Autowired
  private ParticipantRepository participantRepository;

  @Autowired
  private ParticipantRepositoryImpl participantRepositoryImpl;

  @Autowired
  private UserRepositoryImpl userRepositoryImpl;

  @Override
  public List<User> makeGameParticipant(GameRoom gameRoom, List<PlayerInfoRequest> playerInfoList) {

    List<User> gameUsers = userRepositoryImpl.getUserList(playerInfoList);
    gameUsers.forEach(user -> {
      participantRepository.save(new GameParticipants(gameRoom, user, 0));
    });

    return gameUsers;

  }

  @Override
  public void addRecord(GameParticipants participants) {
    System.out.println("participant addRecord: " + participants.getId());
    participantRepository.save(participants);
  }

  @Override
  public GameRoom getPlaying(String username) {
    return participantRepositoryImpl.getPlaying(username);
  }
}
