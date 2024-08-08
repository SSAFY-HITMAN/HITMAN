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
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", gameRoomId),"{\"msgType\":\"ready\"}");
  }

  public void processAlertMessage(String gameId, String alertJSON) {
    messagingTemplate.convertAndSend(String.format("/topic/room/%s", gameId), alertJSON);
  }

  public void startGame(Long id) {
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", id), "{\"msgType\":\"start\"}");
  }

  public void changeTarget(String username, String newTarget, long gameId){
    String jsonPayload = String.format("{\"msgType\":\"start\", \"hunter\":\"%s\", \"target\":\"%s\"}", username, newTarget);
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", gameId), jsonPayload);
  }

  public void notifyStatus(String username, long gameId) {
    String jsonPayload = String.format("{\"msgType\":\"caught\", \"user\":\"%s\"}", username);
    messagingTemplate.convertAndSend(String.format("/topic/room/%d", gameId), jsonPayload);
  }
}
