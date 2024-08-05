package com.boricori.service;

import com.boricori.entity.GameRoom;
import com.boricori.game.GameManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.format.DateTimeFormatter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

  private final SimpMessagingTemplate messagingTemplate;

  private final GameManager gameManager = GameManager.getGameManager();

  private final ObjectMapper mapper = new ObjectMapper();


  public MessageService(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }


  public void readyGame(Long gameRoomId, GameRoom gameRoom){
    // 여기는 현재 방에 웹소켓으로 연결된 유저들에게 알림만 주면 되므로 kafka 거칠 필요 없음
    // pub('app/start') 받아서 sub('/topic/general/roomId') 한 유저들에게 뿌려줌
    String startJSON = String.format("{\"msgType\":\"ready\",\"gameId\":\"%d\", \"mapSize\":\"%d\", \"gameTime\":\"%d\", \"startTime\":\"%s\", \"lat\":\"%s\", \"lng\":\"%s\"}",
        gameRoom.getId(),
        gameRoom.getMapSize(),
        gameRoom.getGameTime(),
        gameRoom.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
        gameRoom.getCenterLat(),
        gameRoom.getCenterLng());
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", gameRoomId), startJSON);
  }

  public void processAlertMessage(String gameId, String alertJSON) {
    messagingTemplate.convertAndSend(String.format("/topic/room/%s", gameId), alertJSON);
  }

  public void startGame(Long id) {
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", id), "{\"msgType\":\"start\"}");
  }
}
