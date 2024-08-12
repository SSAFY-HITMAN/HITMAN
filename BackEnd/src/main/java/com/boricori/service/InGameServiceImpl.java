package com.boricori.service;


import com.boricori.dto.ItemCount;
import com.boricori.dto.GameResult;
import com.boricori.dto.request.inGame.UpdatePlayerScoreRequest;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.entity.*;
import com.boricori.exception.NotAPlayerException;
import com.boricori.game.GameManager;
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
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import com.boricori.repository.userRepo.UserRepositoryImpl;
import jakarta.transaction.Transactional;
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
  private UserRepositoryImpl userRepository;
  @Autowired
  private RedisTemplate<String, String> redisTemplate;

  private GameManager gameManager = GameManager.getGameManager();

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
  @Transactional
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
  @Transactional
  public GameParticipants completeMission(Long gameId, String username, long missionId) {
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    player.getBullet();
    inGameRepositoryImpl.updateMission(missionId, player);
    return player;
  }

  @Override
  @Transactional
  public Item getItem(GameParticipants player) {
    Item item = itemRepositoryImpl.getItem();
    Optional<InGameItems> currCount = inGameItemsRepository.findByUserAndItem(player, item);
    if (currCount.isPresent()){
      currCount.get().incrementCount();
    }else{
      inGameItemsRepository.save(InGameItems.builder().item(item).user(player).count(1).build());
    }
    return item;
  }

  @Override
  @Transactional
  public void useItem(Long gameId, String username, long itemId) {
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    InGameItems item = inGameRepositoryImpl.getActivatedItem(player, itemId);
    if (null != item) {
      item.useItem();
    }
    // else 오류 처리 해야함
  }

  @Override
  public void catchTarget(User user, User target, long gameId) {
    GameParticipants hunterP = participantRepository.getByUsername(user.getUsername(), gameId);
    GameParticipants targetP = participantRepository.getByUsername(target.getUsername(), gameId);
    targetP.eliminate();
    hunterP.kill();
    hunterP.addBullets(targetP.getBullets());
    List<InGameItems> unusedItems = inGameRepositoryImpl.targetItemsCount(targetP);
    if (null != unusedItems && !unusedItems.isEmpty()){
      for (InGameItems igItem : unusedItems) {
        inGameRepositoryImpl.addItems(hunterP, igItem);
      }
    }
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
  public List<ItemCount> getPlayerItems(GameParticipants player){
    return inGameRepositoryImpl.getPlayersItems(player);
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

  @Override
  public Mission getMissionById(long missionId) {
    return missionRepository.findById(missionId).orElse(null);
  }

  @Override
  public void addGamePlayerScore(long gameId) {
    List<String> users = gameManager.EndGameUserInfo(gameId);
    UpdatePlayerScoreRequest userA = participantRepository.getTwoUserInfo(users.get(0), gameId);
    UpdatePlayerScoreRequest userB = participantRepository.getTwoUserInfo(users.get(1), gameId);

    int scoreA = 2000;
    int scoreB = 1000;

    if (userA.getKills() == userB.getKills()) {
      if (userA.getMissionComplete() == userB.getMissionComplete()) {
        scoreB = 2000; // 두 사용자 모두 2000점
      } else if (userA.getMissionComplete() < userB.getMissionComplete()) {
        scoreA = 1000;
        scoreB = 2000;
      }
    } else if (userA.getKills() < userB.getKills()) {
      scoreA = 1000;
      scoreB = 2000;
    }

    participantRepository.updateUserScore(userA.getUserId(), scoreA);
    participantRepository.updateUserScore(userB.getUserId(), scoreB);

    updatePlayersScore(gameId);
  }


  private void updatePlayersScore(long gameId) {
    List<GameParticipants> playersInfo = participantRepository.getPlayersInfo(gameId);
    for (GameParticipants player : playersInfo) {
      userRepository.addUserScore(player.getUser().getUserId(), player.getScore());
    }
  }

  @Override
  public GameResult finishGameAndHandleLastTwoPlayers(long gameId){
    finishGame(gameId);
    List<String> users = gameManager.EndGameUserInfo(gameId);
    GameParticipants userA = participantRepository.getByUsername(users.get(0), gameId);
    GameParticipants userB = participantRepository.getByUsername(users.get(1), gameId);
    String winner = determineWinner(userA, userB);
    String winner2 = null;
    if (winner == null){
      winner = userA.getUser().getUsername();
      winner2 = userB.getUser().getUsername();
    }
    List<EndGameUserInfoResponse> usersInfo = participantRepository.getEndGamePlayersInfo(gameId);
    return new GameResult(gameId, winner, winner2, usersInfo);
  }



  private String determineWinner(GameParticipants userA, GameParticipants userB) {
    if (userA.getScore() == userB.getScore()) {
      return null;
    }
    return userA.getScore() > userB.getScore() ? userA.getUser().getUsername() : userB.getUser().getUsername();
  }

  // redis expired = 4 일 때, 타임아웃 종료
  @Override
  public GameResult gameTimeout(long gameId){
    finishGame(gameId);
    List<EndGameUserInfoResponse> res = participantRepository.getEndGamePlayersInfo(gameId);
    return new GameResult(gameId, null, null, res);
  }

  @Override
  @Transactional
  public void finishGame(long gameId){
    gameRoomRepository.findById(gameId).ifPresent(GameRoom::finish);
  }
}
