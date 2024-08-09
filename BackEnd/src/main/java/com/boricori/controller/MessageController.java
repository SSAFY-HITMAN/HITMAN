package com.boricori.controller;

import com.boricori.dto.RoomMessage;
import com.boricori.dto.response.gameroom.EnterMessageResponse;
import com.boricori.service.GameRoomService;
import com.boricori.service.InGameService;
import com.boricori.service.MessageService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Controller
public class MessageController {

  private final MessageService messageService;

  @Autowired
  private GameRoomService gameRoomService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Autowired
  InGameService inGameService;

  public MessageController(MessageService messageService) {
    this.messageService = messageService;
  }


  // Convert LocalDateTime to epoch seconds
  public static long localDateTimeToEpochSeconds(LocalDateTime localDateTime) {
    return localDateTime.toEpochSecond(ZoneOffset.UTC);
  }

  @MessageMapping("/enter")
  public void enterRoom(RoomMessage message) throws Exception {
//    String roomId = message.getRoomId();
//    String userName = message.getUsername();
//    gameRoomService.enterRoom(roomId, userName);
//    messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
  }

  @MessageMapping("/leave")
  public void leaveGame(RoomMessage message) {
//    String roomId = message.getRoomId();
//    String userName = message.getUsername();
//    gameRoomService.leaveRoom(roomId, userName);
  }


  @EventListener
  public void handleSTOMPConnectEvent(SessionConnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String username = headerAccessor.getFirstNativeHeader("username");
    // username을 세션 속성에 저장
    headerAccessor.getSessionAttributes().put("username", username);
  }



  @EventListener
  public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = headerAccessor.getSessionId();
    String destination = headerAccessor.getDestination();
    String status = destination.split("/")[2];
    String roomId = destination.split("/")[3];
    headerAccessor.getSessionAttributes().put("status", status);
    headerAccessor.getSessionAttributes().put("roomId", roomId);
    String username = (String) headerAccessor.getSessionAttributes().get("username");
    if (status.equals("waiting")){
      gameRoomService.enterRoom(roomId, sessionId, username);
      List<String> users = gameRoomService.GameRoomPlayerAll(roomId);
      EnterMessageResponse message = new EnterMessageResponse("users", users);
      messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }
    if (status.equals("play")){
      // Redis에 disconnect 된 유저가 있는 지 확인 후 있으면 60초 안에 재접속한 유저니까 기록 삭제
      // 없으면 새로 생긴 방에 접속한 유저거나 이미 60초 지나서 아웃처리된 유저, 처리 필요 없음
      inGameService.rejoin(username, roomId);
    }
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = headerAccessor.getSessionId();
    Map<String, Object> attr = headerAccessor.getSessionAttributes();
    String roomId = (String) attr.get("roomId");
    String status = (String) attr.get("status");
    String username = (String) attr.get("username");
    if (status.equals("waiting")){
//      System.out.println("roomId:" + roomId + ", sessionId: " + sessionId);
      List<String> users = gameRoomService.leaveRoom(roomId, sessionId);
      EnterMessageResponse message = new EnterMessageResponse("users", users);
      messagingTemplate.convertAndSend("/topic/room/"+roomId, message);
    }
    if (status.equals("play")){
      // Redis에 60초 후 만료되는 username-roomId key 저장
      inGameService.stopPlaying(username, roomId);
    }
  }
}