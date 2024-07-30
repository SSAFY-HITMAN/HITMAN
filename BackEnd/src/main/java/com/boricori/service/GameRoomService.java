package com.boricori.service;

import com.boricori.dto.request.gameroom.GameRequest;
import com.boricori.dto.request.gameroom.StartGameRoomRequest;
import com.boricori.dto.response.gameroom.CreateGameRoomResponse;
import com.boricori.entity.GameRoom;
import com.google.zxing.WriterException;

import java.io.IOException;

public interface GameRoomService {

  public CreateGameRoomResponse createRoom(GameRequest request) throws IOException, WriterException;
  
  public int findMaxPlayerCountRoom(Long id);

  public int getCurrentRoomPlayerCount(String roomId);

  public void enterRoom(String roomId);

  public GameRoom updateRoom(Long id, StartGameRoomRequest request);

  public GameRoom findGame(Long id);
}
