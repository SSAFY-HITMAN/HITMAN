package com.boricori.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private ConcurrentHashMap<String, WebSocketSession> userInfo = new ConcurrentHashMap<>();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        // 1. websocket 연결시 username message
        if(payload.startsWith("send:")){
            String jsonString = payload.substring(5);
            JsonNode jsonNode = objectMapper.readTree(jsonString);

            String username = jsonNode.get("username").asText();
            userInfo.put(username, session);
        }else if (payload.startsWith("click:")) { // 2. 1 : 1일 채팅 메시지
            String jsonString = payload.substring(6);
            JsonNode jsonNode = objectMapper.readTree(jsonString);

            String type = jsonNode.get("type").asText();
            String fromUsername = jsonNode.get("fromUser").asText();
            String toUsername = jsonNode.get("toUser").asText();

            if(type.equals("offer")){ // 요청 메시지
                WebSocketSession webSocketSession = userInfo.get(toUsername);
                if (webSocketSession != null && webSocketSession.isOpen()) {
                    webSocketSession.sendMessage(new TextMessage(message.getPayload()));
                }
            }else if(type.equals("answer")){ // 응답 메시지
                WebSocketSession webSocketSession = userInfo.get(toUsername);
                if (webSocketSession != null && webSocketSession.isOpen()) {
                    webSocketSession.sendMessage(new TextMessage(message.getPayload()));
                    userInfo.remove(toUsername);
                    userInfo.remove(fromUsername);
                }
            }

        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("나갔습니다");
    }
}
