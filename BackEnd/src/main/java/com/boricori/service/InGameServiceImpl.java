package com.boricori.service;

import com.boricori.dto.request.inGame.MissionChangeRequest;
import com.boricori.dto.request.inGame.UseItemRequest;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.InGameItems;
import com.boricori.entity.InGameMissions;
import com.boricori.entity.Item;
import com.boricori.entity.Mission;
import com.boricori.entity.User;
import com.boricori.exception.NotAPlayerException;
import com.boricori.repository.GameRoomRepo.GameRoomRepository;
import com.boricori.repository.ParticipantRepo.ParticipantRepositoryImpl;
import com.boricori.repository.inGameRepo.InGameItemsRepository;
import com.boricori.repository.inGameRepo.InGameMissionsRepository;
import com.boricori.repository.inGameRepo.InGameRepositoryImpl;
import com.boricori.repository.inGameRepo.ItemRepository;
import com.boricori.repository.inGameRepo.ItemRepositoryImpl;
import com.boricori.repository.inGameRepo.MissionRepository;
import com.boricori.repository.inGameRepo.MissionRepositoryImpl;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class InGameServiceImpl implements InGameService{

  @Autowired
  private MissionRepository missionRepository;
  @Autowired
  private ItemRepository itemRepository;
  @Autowired
  private MissionRepositoryImpl missionRepositoryImpl;
  @Autowired
  private InGameRepositoryImpl inGameRepositoryImpl;
  @Autowired
  private ItemRepositoryImpl itemRepositoryImpl;
  @Autowired
  private ParticipantRepositoryImpl participantRepository;
  @Autowired
  private InGameMissionsRepository inGameMissionsRepository;
  @Autowired
  private InGameItemsRepository inGameItemsRepository;
  @Autowired
  private GameRoomRepository gameRoomRepository;
  @Autowired
  private RedisTemplate<String, String> redisTemplate;

  @Override
  public List<Mission> assignMissions(String username, Long gameId) {
    List<Mission> missions = missionRepositoryImpl.getMissions();
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    for (Mission m : missions){
      InGameMissions igm = InGameMissions.builder().missionId(m).user(player).build();
      inGameMissionsRepository.save(igm);
    }
    return missions;
  }

  @Override
  public Mission changeMission(Long gameId, String username, long missionId) {
    Mission newMission =  missionRepositoryImpl.changeMission(missionId);
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    inGameMissionsRepository.save(
        InGameMissions.builder().missionId(newMission).user(player).build()
    );
    inGameRepositoryImpl.updateMission(missionId, player);
    return newMission;
  }

  @Override
  public void completeMission(Long gameId, String username, long missionId) {
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    inGameRepositoryImpl.updateMission(missionId, player);
  }

  @Override
  public Item getItem(Long gameId, String username) {
    Item item = itemRepositoryImpl.getItem();
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    inGameItemsRepository.save(InGameItems.builder().item(item).user(player).build());
    return item;
  }

  @Override
  public void useItem(Long gameId, String username, long itemId) {
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    inGameRepositoryImpl.useItem(player, itemId);
  }

  @Override
  public void catchTarget(User user, User target, long gameId) {
    participantRepository.changeStatus(target, gameId);
    participantRepository.addKills(user);
    GameParticipants participant = participantRepository.getByUsername(user.getUsername(), gameId);
    List<Item> unusedItems = inGameRepositoryImpl.getUserItems(target);
    List<InGameItems> igItems = new ArrayList<>();
    unusedItems.forEach(item -> igItems.add(new InGameItems(participant, item)));
    inGameItemsRepository.saveAll(igItems);
  }

  @Override
  public GameParticipants checkIfPlayer(String username, long gameId) {
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    if (player == null) {
      throw new NotAPlayerException();
    }
    return player;
  }

  @Override
  public List<Mission> getMissions(GameParticipants player) {
    return inGameRepositoryImpl.getMissions(player);
  }

  @Override
  public List<Item> getItems(GameParticipants player) {
    return inGameRepositoryImpl.getItems(player);
  }
  @Override
  public void stopPlaying(String username, String roomId) {
    redisTemplate.opsForValue().set((username + "-" + roomId + "-left"), "leave", 60, TimeUnit.SECONDS);
  }

  @Override
  public void rejoin(String username, String roomId) {
    redisTemplate.opsForValue().getAndDelete((username + "-" + roomId + "-left"));
  }

  @Override
  public void killUser(String username, long roomId) {
    participantRepository.changeStatusByName(username, roomId);
  }
}
