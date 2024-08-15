package com.boricori.entity;

import com.boricori.dto.request.gameroom.GameRequest;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Getter
public class GameRoom {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "game_id")
  private Long id;

  @Column(length = 64, nullable = false)
  private String roomName = "";

  @Column(nullable = false)
  private int maxPlayer;

  private boolean isActivated;

  @Column(nullable = false)
  private int mapSize;

  private int gameTime;
  private LocalDateTime startTime;
  private LocalDateTime endTime;

  private String centerLat;
  private String centerLng;

  private String gameCode;

  @Column(length = 1024)
  private String qrCode;

  @Builder
  public GameRoom(GameRequest gameRoomRequest) {
    roomSetting(gameRoomRequest);
    isActivated = true;
  }

  private void roomSetting(GameRequest gameRoomRequest) {
    this.roomName = gameRoomRequest.getName();
    this.maxPlayer = gameRoomRequest.getMaxPlayer();
    this.mapSize = gameRoomRequest.getMapSize();
    this.gameTime = gameRoomRequest.getGameTime();
  }

  public void setCodeNumber(String code){
    this.gameCode = code;
  }


  public void createQrCode(String qrCode){
    this.qrCode = qrCode;
  }

  public void startGameTime(){
    this.startTime = LocalDateTime.now().plusSeconds(13);
  }

  public void finish(){
    endTime = LocalDateTime.now();
    isActivated = false;
  }

  public void setCenter(String centerLat, String centerLng) {
    this.centerLat = centerLat;
    this.centerLng = centerLng;
  }
}
