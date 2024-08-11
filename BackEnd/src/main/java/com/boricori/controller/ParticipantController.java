package com.boricori.controller;

import com.boricori.dto.response.ParticipantResponse;
import com.boricori.dto.response.ParticipantsResponse;
import com.boricori.entity.GameRoom;
import com.boricori.service.GameRoomService;
import com.boricori.service.ParticipantsService;
import com.boricori.service.UserService;
import com.boricori.util.ResponseEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게임 참여자 컨트롤러", description = "게임에 참여하는 인원의 상태를 관리하는 API")
@RestController
@RequestMapping("/participants")
public class ParticipantController {

  @Autowired
  private UserService userService;

  @Autowired
  private GameRoomService gameRoomService;

  @Autowired
  private ParticipantsService participantsService;


  @Operation(summary = "현재 플레이중인 게임 검색", description = "유저가 플레이중이던 게임이 있으면 참가 확인")
  @GetMapping("/playing")
  public ResponseEntity<Long> getPlayingGame(HttpServletRequest req){
    String username = (String) req.getAttribute("username");
    GameRoom game = participantsService.getPlaying(username);
    if (game == null){
      return ResponseEntity.status(ResponseEnum.NOT_FOUND.getCode()).body(null);
    }
    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(game.getId());
  }


  @GetMapping("/{playId}")
  @Operation(summary = "모든 게임 참여자 상태", description = "게임에 참여 중인 모든 인원의 상태를 반환해줍니다.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK"),
  })
  public ResponseEntity<? extends ParticipantsResponse> getGameParticipants(
      @PathVariable("playId") String playId) {

    return new ResponseEntity<ParticipantsResponse>(new ParticipantsResponse(), HttpStatus.OK);
  }

  @GetMapping("/{playId}/{userName}")
  @Operation(summary = "특정 게임 참여자 상태", description = "특정 게임 참여자의 상태를 반환해줍니다.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK"),
  })
  public ResponseEntity<? extends ParticipantResponse> getGameParticipant(
      @PathVariable("playId") String playId, @PathVariable("userName") String userName) {

    return new ResponseEntity<ParticipantResponse>(new ParticipantResponse(), HttpStatus.OK);

  }

//  @PatchMapping("/{playId}/{userName}/die")
//  @Operation(summary = "게임 참여자가 죽을 시", description = "게임 참여자의 죽음을 반영합니다.")
//  @ApiResponses(value = {
//      @ApiResponse(responseCode = "200", description = "OK"),
//  })
//  public ResponseEntity<?> patchParticipantDie(
//      @PathVariable("playId") String playId, @PathVariable("userName") String userName) {
//
//    return ResponseEntity.ok(200);
//  }
//
//  @PatchMapping("/{playId}/{userName}/clear")
//  @Operation(summary = "게임 참여자가 미션을 완료할 시", description = "게임 참여자가 미션을 성공하면, 미션 완료 횟수를 하나 증가시킵니다.")
//  @ApiResponses(value = {
//      @ApiResponse(responseCode = "200", description = "OK"),
//  })
//  public ResponseEntity<?> patchParticipantClear(
//      @PathVariable("playId") String playId, @PathVariable("userName") String userName) {
//
//    return ResponseEntity.ok(200);
//  }
//
//  @PatchMapping("/{playId}/{userName}/kill")
//  @Operation(summary = "상대를 잡았을 시", description = "게임 참여자가 상대를 잡은 횟수를 하나 증가시킵니다.")
//  @ApiResponses(value = {
//      @ApiResponse(responseCode = "200", description = "OK"),
//  })
//  public ResponseEntity<?> patchParticipantKill(
//      @PathVariable("playId") String playId, @PathVariable("userName") String userName) {
//
//    return ResponseEntity.ok(200);
//  }

//  @GetMapping("{id}/enter")
//  @Operation(summary = "게임 참여 요청", description = "게임 시작 후 게임 참여자로 저장합니다.")
//  @ApiResponses(value = {
//      @ApiResponse(responseCode = "200", description = "OK"),
//  })
//  public ResponseEntity<JoinGameRoomResponse> enterGame(@PathVariable Long gameId) {
//    String email = "ssafy"; // 필터 걸기 전 임시
//    User user = userService.findByEmail(email);
//    GameRoom game = gameRoomService.findGame(gameId);
//    participantsService.addRecord(GameParticipants.builder().gameRoom(game).user(user).build());
//    return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(JoinGameRoomResponse.of(game));
//  }

}
