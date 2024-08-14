package com.boricori.service;

import com.boricori.dto.GameResult;
import com.boricori.dto.response.gameroom.end.EndGameResponse;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.entity.GameRoom;
import com.boricori.game.GameManager;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

  private final SimpMessagingTemplate messagingTemplate;

  private final GameManager gameManager = GameManager.getGameManager();

  private static final ObjectMapper mapper = new ObjectMapper();

  public MessageService(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }

  public void readyGame(Long gameRoomId, GameRoom gameRoom){
    messagingTemplate.convertAndSend(String.format("/topic/waiting/%d", gameRoomId),"{\"msgType\":\"ready\"}");
  }

  public void startGame(Long id) {
    messagingTemplate.convertAndSend(String.format("/topic/waiting/%d", id), "{\"msgType\":\"start\"}");
  }

  public void processAlertMessage(String gameId, String alertJSON) {
    messagingTemplate.convertAndSend(String.format("/topic/play/%s", gameId), alertJSON);
  }

  public void changeTarget(String username, String newTarget, long gameId){
    String jsonPayload = String.format("{\"msgType\":\"start\", \"hunter\":\"%s\", \"target\":\"%s\"}", username, newTarget);
    messagingTemplate.convertAndSend(String.format("/topic/play/%d", gameId), jsonPayload);
  }

  public void eliminateUser(String username, long gameId) {
    String jsonPayload = String.format("{\"msgType\":\"eliminated\", \"user\":\"%s\"}", username);
    messagingTemplate.convertAndSend(String.format("/topic/play/%d", gameId), jsonPayload);
  }

  public void useItem(long gameId, String username, String effect) {
    String jsonPayload = String.format(
        "{\"msgType\":\"useItem\", \"username\":\"%s\", \"effect\":\"%s\"}", username, effect);
    messagingTemplate.convertAndSend(String.format("/topic/play/%d", gameId), jsonPayload);
  }

  public void endGameScore(GameResult result) {
    try {
      String toJSON = mapper.writeValueAsString(result);
      String jsonPayload = String.format("{\"msgType\":\"end\", \"data\":\"%s\"}", toJSON);
      messagingTemplate.convertAndSend(String.format("/topic/play/%d", result.getGameId()), jsonPayload);
    } catch (JsonProcessingException e) {
      System.out.println(e.getMessage());
    }
  }

  public void playersCount(long gameId, int playersLeft) {
    String jsonPayload = String.format("{\"msgType\":\"playerCount\", \"count\":\"%d\"}", playersLeft);
    messagingTemplate.convertAndSend(String.format("/topic/play/%d", gameId), jsonPayload);
  }
}
