package com.boricori.controller;

import static com.boricori.util.ResponseEnum.FAIL;
import static com.boricori.util.ResponseEnum.SUCCESS;

import com.boricori.dto.request.gameroom.EndGameRoomRequest;
import com.boricori.dto.request.gameroom.GameRequest;
import com.boricori.dto.request.gameroom.StartGameRoomRequest;
import com.boricori.dto.response.gameroom.CreateGameRoomResponse;
import com.boricori.dto.response.gameroom.EnterRoomResponse;
import com.boricori.dto.response.gameroom.GameInfoResponse;
import com.boricori.dto.response.gameroom.end.EndGameResponse;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.User;
import com.boricori.game.GameManager;
import com.boricori.service.GameRoomService;
import com.boricori.service.InGameService;
import com.boricori.service.MessageService;
import com.boricori.service.ParticipantsService;
import com.boricori.service.UserService;
import com.boricori.util.ResponseEnum;
import com.boricori.util.UserCircularLinkedList;
import com.google.zxing.WriterException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/gameroom")
@RestController
public class GameRoomController {

  @Autowired
  private GameRoomService gameRoomService;

  @Autowired
  private ParticipantsService participantsService;

  @Autowired
  private InGameService inGameService;

  @Autowired
  private RedisTemplate<String, String> redisTemplate;

  @Autowired
  private MessageService messageService;

  @Autowired
  private UserService userService;

  private final GameManager gameManager = GameManager.getGameManager();


  @PostMapping("/create")
  @Operation(summary = "게임방 생성", description = "게임방 생성")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "성공"),
      @ApiResponse(responseCode = "404", description = "실패"),
      @ApiResponse(responseCode = "500", description = "서버 오류")
  })
  public ResponseEntity<CreateGameRoomResponse> createGameRoom(
      @RequestBody @Parameter(description = "게임방 세팅", required = true) GameRequest gameRequest,
      HttpServletRequest request) {
    String userName = (String) request.getAttribute("username");
    try {
      CreateGameRoomResponse room = gameRoomService.createRoom(gameRequest, userName);
      return ResponseEntity.status(200).body(room);
    } catch (WriterException | IOException e) {
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/{gameCode}")
  @Operation(summary = "게임방 참여", description = "게임방 인원 확인 후 입장")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "성공"),
      @ApiResponse(responseCode = "404", description = "실패"),
  })
  public ResponseEntity<EnterRoomResponse> enterGameRoom(
      @PathVariable @Parameter(description = "방 입장 코드", required = true) String gameCode,
      HttpServletRequest req) {
    String username = (String) req.getAttribute("username");
    GameRoom game = gameRoomService.findGameByCode(gameCode);
    int maxCount = game.getMaxPlayer();
    int currCount = gameRoomService.getCurrentRoomPlayerCount(String.valueOf(game.getId()));
//    int currCount = 1;
    if (currCount >= maxCount) {
      return ResponseEntity.status(FAIL.getCode()).body(new EnterRoomResponse("Full", null));
    }
    return ResponseEntity.status(SUCCESS.getCode()).body(new EnterRoomResponse("Available",
        game.getId()));
  }

  @PostMapping("/{id}/start")
  @Operation(summary = "게임 시작", description = "게임 실행, 유저 DB 등록 및 유저간 잡기 순서 정하고 3초뒤 게임 시작")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "성공"),
      @ApiResponse(responseCode = "404", description = "실패"),
      @ApiResponse(responseCode = "500", description = "서버 오류")
  })
  public ResponseEntity<String> startGameRoom(
      @PathVariable @Parameter(description = "게임 방id", required = true) long id,
      @RequestBody @Parameter(description = "게임 시작 서버 데이터 전달", required = true) StartGameRoomRequest request,
      HttpServletRequest req) {

    String username = (String) req.getAttribute("username");
    // 게임 방 튜플 생성
    GameRoom gameRoom = gameRoomService.updateRoom(id, request);
    List<String> usernames = gameRoomService.GameRoomPlayerAll(
        String.valueOf(id)); // Redis에서 불러올 부분
    List<User> users = new ArrayList<>();
    for (String u : usernames) {
      users.add(userService.findByUsername(u));
    }
    users.forEach(u -> participantsService.addRecord(
        GameParticipants.builder().gameRoom(gameRoom).user(u).build()));
//     게임 참여 방 id에 맞게 꼬리잡기 리스트 생성 Map<int, List<ParticipantNameDto>>
    makeCatchableList(gameRoom.getId(), users);
    // 알림 시간 Redis에 넣기
    int interval = gameRoom.getGameTime() * 60 / 4;
    for (int t = 1; t < 5; t++) {
      redisTemplate.opsForValue()
          .set(String.format("%d-%d", gameRoom.getId(), t), String.valueOf(t), interval * t,
              TimeUnit.SECONDS);
    }
    messageService.readyGame(gameRoom.getId(), gameRoom);
    // 3초 대기
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("게임 시작 중 오류 발생");
    }
    messageService.startGame(gameRoom.getId());
    return ResponseEntity.status(SUCCESS.getCode()).body("GAME STARTED");
  }

  private void makeCatchableList(Long roomId, List<User> users) {
    gameManager.shuffleUsers(users);
    UserCircularLinkedList userCircularLinkedList = gameManager.makeUserCatchableList(users);

    GameManager.catchableList.put(roomId, userCircularLinkedList);
  }

  @GetMapping("{gameId}/startInfo")
  @Operation(summary = "게임 초기 정보 요청", description = "게임이 실제 시작하기 전, 게임 정보와 타겟, 미션을 받습니다.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK"),
  })
  public ResponseEntity<GameInfoResponse> enterGame(@PathVariable Long gameId,
      HttpServletRequest req) {
    String username = (String) req.getAttribute("username");
    User target = GameManager.catchableList.get(gameId).getByUsername(username).next.data;
    GameRoom game = gameRoomService.findGame(gameId);
    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(
        GameInfoResponse.of(game, target));
  }


  @PatchMapping("/end")
  @Operation(summary = "게임 종료", description = "게임 종료")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "성공"),
      @ApiResponse(responseCode = "404", description = "실패"),
      @ApiResponse(responseCode = "500", description = "서버 오류")
  })
  public ResponseEntity<EndGameResponse> endGameRoom(
      @RequestBody @Parameter(description = "게임 종료 후 데이터 전달", required = true) EndGameRoomRequest request) {

    return null;
  }
}
