package com.boricori.util;

import com.boricori.service.InGameService;
import com.boricori.service.MessageService;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

@Component
public class RedisKeyExpirationListener implements MessageListener {

  private final static int GAME_ENDED = 4;

  @Autowired
  private RedisTemplate<String, String> redisTemplate;

  @Autowired
  private MessageService messageService;

  @Autowired
  private InGameService inGameService;

  @Override
  public void onMessage(Message message, byte[] pattern) {
    String expiredKey = new String(message.getBody());
    System.out.println("Key expired: " + expiredKey);

    // 키 형식: gameRoomId-AlertDegree
    String[] parts = expiredKey.split("-");
    if (parts.length == 2) {
      String gameRoomId = parts[0];
      String alertDegree = parts[1];
      // kafka의 topic: game-alert에 보내놓기
      String jsonData = String.format("{\"msgType\":\"alert\", \"alertDegree\":\"%s\"}", alertDegree);
      messageService.processAlertMessage(gameRoomId, jsonData);
    }
    else if (parts.length == 3){
      System.out.println("LEFT: " + expiredKey);
      String username = parts[0];
      long roomId = Long.parseLong(parts[1]);
      inGameService.killUser(username, roomId);
      // 해당 유저 쫓던 유저의 타겟이 바뀌는 로직 구현 필요함
    }
    else {
      System.err.println("Invalid key format: " + expiredKey);
    }
  }
}
