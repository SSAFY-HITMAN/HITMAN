package com.boricori.util;

import com.boricori.dto.GameResult;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.User;
import com.boricori.game.GameManager;
import com.boricori.service.InGameService;
import com.boricori.service.MessageService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
public class RedisKeyExpirationListener implements MessageListener {

  private final static String GAME_ENDED = "4";

  @Autowired
  private MessageService messageService;

  @Autowired
  private InGameService inGameService;

  GameManager gameManager = GameManager.getGameManager();

  @Override
  public void onMessage(Message message, byte[] pattern) {
    String expiredKey = new String(message.getBody());
    System.out.println("Key expired: " + expiredKey);
    // 키 형식: gameRoomId-AlertDegree
    String[] parts = expiredKey.split("-");
    if (parts.length == 2) {
      if (parts[1].equals("refresh")){
        return;
      }
      String gameRoomId = parts[0];
      String alertDegree = parts[1];
      System.out.println("roomId: " + gameRoomId + "degree: " + alertDegree);
      if (!alertDegree.equals(GAME_ENDED)){
        String jsonData = String.format("{\"msgType\":\"alert\", \"alertDegree\":\"%s\"}", alertDegree);
        messageService.processAlertMessage(gameRoomId, jsonData);
      }else{ // timeout
        GameResult gameResult = inGameService.gameTimeout(Long.parseLong(gameRoomId));
        messageService.endGameScore(gameResult);
      }

    }
    else if (parts.length == 3){
      System.out.println("LEFT: " + expiredKey);
      String username = parts[0];
      long roomId = Long.parseLong(parts[1]);
      inGameService.eliminateUser(username, roomId);
      // 해당 유저 쫓던 유저의 타겟이 바뀌는 로직
      Node<User> hunter = gameManager.removePlayerAndReturnHunter(roomId, username);
      messageService.playersCount(roomId, gameManager.numPlayers(roomId));
      if (gameManager.isLastTwo(roomId)) {
        List<GameParticipants> winners = inGameService.updateWinnerScore(roomId);
        GameResult res = inGameService.finishGameAndHandleLastTwoPlayers(roomId, winners);
        messageService.endGameScore(res);
      }else{
        messageService.changeTarget(hunter.data.getUsername(), hunter.next.data.getUsername(), roomId);
      }
    }
    else {
      System.err.println("Invalid key format: " + expiredKey);
    }
  }
}
