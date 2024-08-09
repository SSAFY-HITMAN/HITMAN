package com.boricori.controller;

import com.boricori.dto.RoomMessage;
import com.boricori.dto.response.gameroom.EnterMessageResponse;
import com.boricori.service.GameRoomService;
import com.boricori.service.MessageService;
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
    String roomId = destination.split("/")[3];
    // 세션 속성에서 username 가져오기
    String username = (String) headerAccessor.getSessionAttributes().get("username");
    // roomId를 세션 속성에 저장
    headerAccessor.getSessionAttributes().put("roomId", roomId);

    gameRoomService.enterRoom(roomId, sessionId, username);
    List<String> users = gameRoomService.GameRoomPlayerAll(roomId);
    EnterMessageResponse message = new EnterMessageResponse("users", users);
    messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = headerAccessor.getSessionId();
    String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
    System.out.println("roomId:" + roomId + ", sessionId: " + sessionId);
    List<String> users = gameRoomService.leaveRoom(roomId, sessionId);
    EnterMessageResponse message = new EnterMessageResponse("users", users);
    messagingTemplate.convertAndSend("/topic/room/"+roomId, message);
  }
}