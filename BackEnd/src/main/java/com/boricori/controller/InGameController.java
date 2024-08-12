package com.boricori.controller;

import com.boricori.dto.ItemCount;
import com.boricori.dto.request.inGame.InGameRequest;
import com.boricori.dto.request.inGame.MissionChangeRequest;
import com.boricori.dto.request.inGame.UseItemRequest;
import com.boricori.dto.response.gameroom.GameInfo;
import com.boricori.dto.response.inGame.InitResponse;
import com.boricori.dto.response.inGame.ItemResponse;
import com.boricori.dto.response.inGame.MissionResponse;
import com.boricori.entity.*;
import com.boricori.exception.NotAPlayerException;
import com.boricori.game.GameManager;
import com.boricori.service.*;
import com.boricori.util.Node;
import com.boricori.util.ResponseEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.boricori.dto.GameResult;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

  @Autowired
  private ImageService imageService;

  @PostMapping("/changeMission")
  public ResponseEntity<MissionResponse> changeMission(@RequestBody MissionChangeRequest request){
    String username = request.getUsername();
    long gameId = request.getGameId();
    long missionId = request.getMissionId();
    Mission newMission = inGameService.changeMission(gameId, username, missionId);
    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(MissionResponse.of(newMission));
  }

//  @Transactional
//  @PostMapping("/completeMission")
//  public ResponseEntity<ItemResponse> completeMission(@RequestBody MissionChangeRequest request){
//    String username = request.getUsername();
//    long gameId = request.getGameId();
//    long missionId = request.getMissionId();
//    inGameService.completeMission(gameId, username, missionId);
//    Item item = inGameService.getItem(gameId, username);
//    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(ItemResponse.of(item));
//  }

  @Transactional
  @PostMapping("/imageMission")
  public ResponseEntity<ItemResponse> imageMission( @RequestParam("file") MultipartFile file,
      @RequestParam("username") String username,
      @RequestParam("gameId") long gameId,
      @RequestParam("missionId") Long missionId){
    Mission mission = inGameService.getMissionById(missionId);
    boolean success = false;
    try {
      if (mission == null){
        throw new IOException();
      }
      if (mission.getCategory() == 1) {
        success = imageService.checkText(file, mission);
      } else if (mission.getCategory() == 2) {
        success = imageService.checkObjects(file, mission);
      } else if (mission.getCategory() == 3) {
        success = imageService.checkColours(file, mission);
      }
      if (success){
        GameParticipants player = inGameService.completeMission(gameId, username, missionId);
        Item item = inGameService.getItem(player);
        return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(ItemResponse.of(item));
      }
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body(null);
      } catch (IOException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
  }

  @PostMapping("/useItem")
  // item_id = 1이면 추격자한테 메시지 (blockGPS)
  // item_id = 2이면 추격자한테 ws메시지 보내기 (blockScreen)
  // item_id = 3이면 전부 프론트에서 처리
  // 모든 경우 백에서 사용 DB 저장
  public void useItem(@RequestBody UseItemRequest request){
    String username = request.getUsername();
    long gameId = request.getGameId();
    long itemId = request.getItemId();
    inGameService.useItem(gameId, username, itemId);
    if (itemId == 1 || itemId == 2){
      Node<User> hunter = gameManager.identifyHunter(gameId, username);
      String effect = itemId == 1 ? "blockGPS" : "blockScreen";
      messageService.useItem(gameId, hunter.data.getUsername(), effect);
    }
  }

  @Transactional
  @PostMapping("/catchTarget")
  public ResponseEntity<String> catchTarget(@RequestBody InGameRequest request) {
    try {
      String username = request.getUsername();
      long gameId = request.getGameId();
      Node<User> targetNode = gameManager.catchTargetForUser(gameId, username);
      Node<User> newTarget = targetNode.next;
      messageService.changeTarget(username, newTarget.data.getUsername(), gameId);
      messageService.eliminateUser(targetNode.data.getUsername(), gameId);
      User user = userService.findByUsername(username);
      inGameService.catchTarget(user, targetNode.data, gameId);

      if (gameManager.isLastTwo(gameId)) {
        inGameService.addGamePlayerScore(gameId);
        GameResult res = inGameService.finishGameAndHandleLastTwoPlayers(gameId);
        messageService.endGameScore(res);
        return ResponseEntity.status(ResponseEnum.REDIRECT.getCode()).body("게임 종료");
      }else {
          return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body("잡았습니다.");
      }
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("알 수 없는 오류");
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
      User target = gameManager.identifyTarget(gameId, username).data;
      List<Mission> playerMissions = inGameService.getMissions(player);
      List<MissionResponse> myMissions = new ArrayList<>();
      List<ItemCount> myItems = null;

      if (playerMissions == null || playerMissions.isEmpty()){
        // 게임 시작 전 초기 설정 단계
        playerMissions = inGameService.assignMissions(username, gameId);
      }else {
        // 게임 진행 중이고, 플레이어가 재접속한 상황
        myItems = inGameService.getPlayerItems(player);
      }
      for (Mission m : playerMissions){
        MissionResponse newM = MissionResponse.of(m);
        myMissions.add(newM);
      }
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode())
          .body(InitResponse.builder().status("alive").gameInfo(GameInfo.of(game))
              .targetName(target.getUsername()).myMissions(myMissions).myItems(myItems).bullets(
                  player.getBullets()).build());

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

  @PatchMapping("/eliminate")
  public void eliminateUser(@RequestBody InGameRequest request){
    long gameId = request.getGameId();
    String username = request.getUsername();
    inGameService.eliminateUser(username, gameId);
    messageService.eliminateUser(username,gameId);
    Node<User> hunter = gameManager.removePlayerAndReturnHunter(gameId, username);
    if (gameManager.isLastTwo(gameId)) {
      GameResult res = inGameService.finishGameAndHandleLastTwoPlayers(gameId);
      messageService.endGameScore(res);
    }else{
      messageService.changeTarget(hunter.data.getUsername(), hunter.next.data.getUsername(), gameId);
    }
  }
}
