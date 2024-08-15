package com.boricori.service;


import com.boricori.dto.ItemCount;
import com.boricori.dto.GameResult;
import com.boricori.dto.request.inGame.UpdatePlayerScoreRequest;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.dto.response.inGame.MissionResponse;
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
  public List<MissionResponse> assignMissions(String username, Long gameId, int currPlayers) {
    List<Mission> missions = missionRepositoryImpl.getMissions(currPlayers);
    GameParticipants player = participantRepository.getByUsername(username, gameId);
    for (Mission m : missions){
      InGameMissions igm = InGameMissions.builder().missionId(m).user(player).build();
      inGameMissionsRepository.save(igm);
    }
    List<MissionResponse> response = new ArrayList<>();
    missions.forEach(m -> response.add(MissionResponse.of(m)));
    return response;
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
    player.missionCompleted();
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
  public List<MissionResponse> getMissions(GameParticipants player) {
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

  @Transactional
  @Override
  public void eliminateUser(String username, long roomId) {
    participantRepository.changeStatusByName(username, roomId);
  }

  @Override
  public Mission getMissionById(long missionId) {
    return missionRepository.findById(missionId).orElse(null);
  }

  @Transactional
  public List<GameParticipants> updateWinnerScore(long gameId) {
    List<GameParticipants> res = new ArrayList<>();
    List<String> users = gameManager.EndGameUserInfo(gameId);
    if (users.isEmpty()){
      updatePlayersScore(gameId);
      return res;
    }
    if (users.size() == 1){
      GameParticipants userA = participantRepository.getByUsername(users.get(0), gameId);
      userA.addScore(2000);
      updatePlayersScore(gameId);
      res.add(userA);
      return res;
    }

    GameParticipants userA = participantRepository.getByUsername(users.get(0), gameId);
    GameParticipants userB = participantRepository.getByUsername(users.get(1), gameId);

    // 킬 수 비교
    if (userA.getKills() > userB.getKills()) {
      userA.addScore(2000); // userA가 1등
      userB.addScore(1000); // userB가 2등
      res.add(userA);
    } else if (userA.getKills() < userB.getKills()) {
      userA.addScore(1000); // userA가 2등
      userB.addScore(2000); // userB가 1등
      res.add(userB);
    } else {
      // 킬 수가 같을 경우 미션 완료 수 비교
      if (userA.getMissionComplete() > userB.getMissionComplete()) {
        userA.addScore(2000); // userA가 1등
        userB.addScore(1000); // userB가 2등
        res.add(userA);
      } else if (userA.getMissionComplete() < userB.getMissionComplete()) {
        userA.addScore(1000); // userA가 2등
        userB.addScore(2000); // userB가 1등
        res.add(userB);
      } else {
        // 킬 수와 미션 완료 수 모두 같을 경우 무승부
        userA.addScore(2000);
        userB.addScore(2000);
        res.add(userA);
        res.add(userB);
      }
    }

    // 추가적인 처리
    updatePlayersScore(gameId);
    return res;
  }

  private void updatePlayersScore(long gameId) {
    List<GameParticipants> playersInfo = participantRepository.getPlayersInfo(gameId);
    for (GameParticipants player : playersInfo) {
      userRepository.addUserScore(player.getUser().getUserId(), player.getScore());
    }
  }

  @Override
  public GameResult finishGameAndHandleLastTwoPlayers(long gameId, List<GameParticipants> winners){
    finishGame(gameId);

    if (winners.isEmpty()){
      List<EndGameUserInfoResponse> usersInfo = participantRepository.getEndGamePlayersInfo(gameId);
      return new GameResult(gameId, null, null, usersInfo);
    }else if (winners.size() == 1){ // 최종 승자가 1명 뿐일 때
      List<EndGameUserInfoResponse> usersInfo = participantRepository.getEndGamePlayersInfo(gameId);
      return new GameResult(gameId, winners.get(0).getUser().getUsername(), null, usersInfo);
    }
    // 승자가 2명일때 (무승부)
    List<EndGameUserInfoResponse> usersInfo = participantRepository.getEndGamePlayersInfo(gameId);
    return new GameResult(gameId,  winners.get(0).getUser().getUsername(), winners.get(1).getUser().getUsername(), usersInfo);
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

  //임시
  @Override
  @Transactional
  public void tempGiveItem(GameParticipants player) {
    List<Item> items = itemRepositoryImpl.allItems();
    for (Item item : items) {
      inGameItemsRepository.save(InGameItems.builder().item(item).user(player).count(1).build());
    }
  }
}
