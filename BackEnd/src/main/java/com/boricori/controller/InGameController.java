package com.boricori.controller;

import com.boricori.dto.request.gameroom.EndGameRoomRequest;
import com.boricori.dto.request.inGame.InGameRequest;
import com.boricori.dto.request.inGame.MissionChangeRequest;
import com.boricori.dto.request.inGame.UseItemRequest;
import com.boricori.dto.response.gameroom.GameInfo;
import com.boricori.dto.response.gameroom.end.EndGameResponse;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.dto.response.inGame.InitResponse;
import com.boricori.dto.response.inGame.ItemResponse;
import com.boricori.dto.response.inGame.MissionResponse;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.Item;
import com.boricori.entity.Mission;
import com.boricori.entity.User;
import com.boricori.exception.NotAPlayerException;
import com.boricori.game.GameManager;
import com.boricori.service.GameRoomService;
import com.boricori.service.InGameService;
import com.boricori.service.MessageService;
import com.boricori.service.UserService;
import com.boricori.util.Node;
import com.boricori.util.ResponseEnum;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게임 컨트롤러", description = "게임 진행 중 일어나는 이벤트 관리")
@RestController
@RequestMapping("/in-game")
public class InGameController {

  @Autowired
  private InGameService inGameService;

  private final GameManager gameManager = GameManager.getGameManager();

  @Autowired
  private UserService userService;

  @Autowired
  private MessageService messageService;

  @Autowired
  private GameRoomService gameRoomService;

  @Transactional
  @PostMapping("/changeMission")
  public ResponseEntity<MissionResponse> changeMission(@RequestBody MissionChangeRequest request){
    String username = request.getUsername();
    long gameId = request.getGameId();
    long missionId = request.getMissionId();
    Mission newMission = inGameService.changeMission(gameId, username, missionId);
    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(MissionResponse.of(newMission));
  }

  @Transactional
  @PostMapping("/completeMission")
  public ResponseEntity<ItemResponse> completeMission(@RequestBody MissionChangeRequest request){
    String username = request.getUsername();
    long gameId = request.getGameId();
    long missionId = request.getMissionId();
    inGameService.completeMission(gameId, username, missionId);
    Item item = inGameService.getItem(gameId, username);
    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(ItemResponse.of(item));
  }

  @Transactional
  @PostMapping("/useItem")
  public void useItem(@RequestBody UseItemRequest request){
    String username = request.getUsername();
    long gameId = request.getGameId();
    long itemId = request.getItemId();
    inGameService.useItem(gameId, username, itemId);
  }

  @Transactional
  @PostMapping("/catchTarget")
  public void catchTarget(@RequestBody InGameRequest request) {
    try {
      String username = request.getUsername();
      long gameId = request.getGameId();
      Node<User> targetNode = gameManager.killTarget(gameId, username);
      Node<User> newTarget = targetNode.next;
      messageService.changeTarget(username, newTarget.data.getUsername(), gameId);
      messageService.notifyStatus(targetNode.data.getUsername(), gameId);
      User user = userService.findByUsername(username);
      inGameService.catchTarget(user, targetNode.data, gameId);

      if (gameManager.isLastTwo(gameId)) {
        handleLastTwoPlayers(gameId);
      }
    } catch (JsonProcessingException e) {
      e.printStackTrace(); // 예외 처리 (필요한 경우 로그로 대체 가능)
    }
  }

  private void handleLastTwoPlayers(long gameId) throws JsonProcessingException {
    List<String> users = gameManager.EndGameUserInfo(gameId);
    GameParticipants userA = inGameService.getUserInfo(gameId, users.get(0));
    GameParticipants userB = inGameService.getUserInfo(gameId, users.get(1));
    String winner = determineWinner(userA, userB);

    List<EndGameUserInfoResponse> usersInfo = new ArrayList<>();
    if (userA.getKills() == userB.getKills() && userA.getMissionComplete() == userB.getMissionComplete()) {
      usersInfo = inGameService.getDrawEndGameUsersInfo(gameId, userA.getUser().getUsername(), userB.getUser().getUsername());
    } else {
      usersInfo = inGameService.getWinEndGameUsersInfo(gameId, winner);
    }

    messageService.endGameScore(gameId, winner, usersInfo);
  }

  private String determineWinner(GameParticipants userA, GameParticipants userB) {
    if (userA.getKills() == userB.getKills()) {
      if (userA.getMissionComplete() > userB.getMissionComplete()) {
        return userA.getUser().getUsername();
      } else if (userA.getMissionComplete() < userB.getMissionComplete()) {
        return userB.getUser().getUsername();
      } else {
        return userA.getUser().getUsername() + " " + userB.getUser().getUsername(); // 무승부
      }
    } else {
      return userA.getKills() > userB.getKills() ? userA.getUser().getUsername() : userB.getUser().getUsername();
    }
  }

  @GetMapping("/init/{gameId}")
  @Operation(summary = "게임 초기 정보 요청", description = "게임에 접속하면 나의 정보, 게임 정보와 타겟을 받습니다.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK"),
  })
  public ResponseEntity<InitResponse> initiate(@PathVariable long gameId, HttpServletRequest req){
    String username = (String) req.getAttribute("username");
    try{
      GameParticipants player = inGameService.checkIfPlayer(username, gameId);
      GameRoom game = gameRoomService.findGame(gameId);
      if (!player.isAlive()){ // 게임이 진행중이고, 플레이어는 아웃된 상태
        InitResponse data = InitResponse.builder().status("dead").gameInfo(GameInfo.of(game)).build();
        return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(data);
      }
      // 플레이어가 살아있는 상태. 게임 시작전일수도, 진행중일 수도 있음
      User target = gameManager.getByUsername(gameId, username).next.data;
      List<Mission> playerMissions = inGameService.getMissions(player);
      List<ItemResponse> myItems = new ArrayList<>();
      List<MissionResponse> myMissions = new ArrayList<>();

      if (playerMissions == null || playerMissions.isEmpty()){
        // 게임 시작 전 초기 설정 단계
        playerMissions = inGameService.assignMissions(username, gameId);
      }else {
        // 게임 진행 중이고, 플레이어가 재접속한 상황
        List<Item> playerItems = inGameService.getItems(player);
        for (Item i : playerItems) {
          ItemResponse newI = ItemResponse.of(i);
          myItems.add(newI);
        }
      }
      for (Mission m : playerMissions){
        MissionResponse newM = MissionResponse.of(m);
        myMissions.add(newM);
      }
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode())
          .body(InitResponse.builder().status("alive").gameInfo(GameInfo.of(game))
              .targetName(target.getUsername()).myMissions(myMissions).myItems(myItems).build());

    }catch (NotAPlayerException e){
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body(null);
    }
  }

//  @GetMapping("/endscore/{roomId}")
//  public ResponseEntity<?> EndGameWinner(@PathVariable long roomId, @RequestBody InGameRequest req){
//    String username = req.getUsername();
//    try {
//      GameParticipants player = inGameService.checkIfPlayer(username, roomId);
//      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(EndGameUserInfoResponse.of(player));
//    }catch (Exception e){
//      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body(null);
//    }
//  }


//  @PatchMapping("/end")
//  @Operation(summary = "게임 종료", description = "게임 종료")
//  @ApiResponses({
//      @ApiResponse(responseCode = "200", description = "성공"),
//      @ApiResponse(responseCode = "404", description = "실패"),
//      @ApiResponse(responseCode = "500", description = "서버 오류")
//  })
//  public ResponseEntity<EndGameResponse> endGameRoom(
//      @RequestBody @Parameter(description = "게임 종료 후 데이터 전달", required = true) EndGameRoomRequest request) {
//
//    return null;
//  }
}
